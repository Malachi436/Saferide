import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface Location {
  lat: number;
  lon: number;
  childId?: string;
}

interface Cluster {
  centroid: Location;
  children: Array<{ childId: string; lat: number; lon: number }>;
}

@Injectable()
export class RouteAutoService {
  private readonly logger = new Logger(RouteAutoService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Auto-generate routes for a school based on children pickup locations
   * Uses bus capacity to determine cluster count
   */
  async autoGenerateRoutes(schoolId: string): Promise<any> {
    this.logger.log(`Starting auto-route generation for school ${schoolId}`);

    // 1. Get all children with pickup locations for this school
    const children = await this.prisma.child.findMany({
      where: {
        schoolId,
        pickupLatitude: { not: null },
        pickupLongitude: { not: null },
      },
    });

    if (children.length === 0) {
      throw new BadRequestException('No children with pickup locations found for this school');
    }

    this.logger.log(`Found ${children.length} children with pickup locations`);

    // 2. Get school details (for route naming and optional school location)
    const school = await this.prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new BadRequestException('School not found');
    }

    // 3. Get available buses to determine capacity
    const buses = await this.prisma.bus.findMany({
      where: {
        driver: {
          user: {
            companyId: school.companyId,
          },
        },
      },
    });

    if (buses.length === 0) {
      throw new BadRequestException('No buses available. Please add buses first.');
    }

    // Calculate average capacity or use largest bus capacity
    const avgCapacity = Math.floor(
      buses.reduce((sum, bus) => sum + bus.capacity, 0) / buses.length,
    );
    const targetChildrenPerRoute = Math.max(10, Math.floor(avgCapacity * 0.8)); // 80% of capacity

    this.logger.log(
      `Average bus capacity: ${avgCapacity}, target children per route: ${targetChildrenPerRoute}`,
    );

    // 4. Determine number of clusters (routes) needed
    const numRoutes = Math.max(1, Math.ceil(children.length / targetChildrenPerRoute));

    this.logger.log(`Creating ${numRoutes} routes for ${children.length} children`);

    // 5. Cluster children by location using k-means
    const childLocations = children.map((child) => ({
      childId: child.id,
      lat: child.pickupLatitude!,
      lon: child.pickupLongitude!,
    }));

    const clusters = this.kMeansClustering(childLocations, numRoutes);

    // 6. Create routes and stops for each cluster
    const createdRoutes = [];
    const routeLabels = this.generateRouteLabels(numRoutes);

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      const routeName = routeLabels[i];

      // Order stops: closest to school first (or by cluster centroid if school has no coords)
      const orderedStops = this.orderStops(
        cluster.children,
        school.latitude && school.longitude
          ? { lat: school.latitude, lon: school.longitude }
          : cluster.centroid,
      );

      // Create route with stops
      const route = await this.prisma.route.create({
        data: {
          name: routeName,
          schoolId,
          stops: {
            create: orderedStops.map((stop, idx) => ({
              name: `Stop ${idx + 1}`,
              latitude: stop.lat,
              longitude: stop.lon,
              order: idx + 1,
            })),
          },
        },
        include: {
          stops: true,
        },
      });

      // Fetch full child details for this route
      const routeChildren = await this.prisma.child.findMany({
        where: {
          id: { in: cluster.children.map((c) => c.childId) },
        },
        include: {
          parent: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
              phone: true,
            },
          },
        },
      });

      createdRoutes.push({
        route,
        childrenCount: cluster.children.length,
        children: routeChildren,
        childrenIds: cluster.children.map((c) => c.childId),
      });

      this.logger.log(
        `Created ${routeName} with ${cluster.children.length} stops for ${cluster.children.length} children`,
      );
    }

    return {
      message: `Successfully created ${numRoutes} routes for ${children.length} children`,
      routes: createdRoutes,
      summary: {
        totalChildren: children.length,
        routesCreated: numRoutes,
        avgChildrenPerRoute: Math.floor(children.length / numRoutes),
        busCapacityUsed: avgCapacity,
      },
    };
  }

  /**
   * K-means clustering algorithm for grouping children by location
   */
  private kMeansClustering(
    points: Array<{ childId: string; lat: number; lon: number }>,
    k: number,
  ): Cluster[] {
    const maxIterations = 100;
    const tolerance = 0.0001;

    // Initialize centroids randomly from existing points
    let centroids: Location[] = this.initializeCentroids(points, k);

    for (let iteration = 0; iteration < maxIterations; iteration++) {
      // Assign each point to nearest centroid
      const clusters: Cluster[] = centroids.map((centroid) => ({
        centroid,
        children: [],
      }));

      for (const point of points) {
        const nearestClusterIdx = this.findNearestCentroid(point, centroids);
        clusters[nearestClusterIdx].children.push(point);
      }

      // Remove empty clusters
      const nonEmptyClusters = clusters.filter((c) => c.children.length > 0);

      // Recalculate centroids
      const newCentroids = nonEmptyClusters.map((cluster) => this.calculateCentroid(cluster.children));

      // Check convergence
      const hasConverged = centroids.every((oldCentroid, idx) => {
        if (idx >= newCentroids.length) return true;
        const newCentroid = newCentroids[idx];
        return this.distance(oldCentroid, newCentroid) < tolerance;
      });

      centroids = newCentroids;

      if (hasConverged) {
        this.logger.log(`K-means converged after ${iteration + 1} iterations`);
        return nonEmptyClusters;
      }
    }

    this.logger.log(`K-means completed ${maxIterations} iterations`);
    return centroids.map((centroid, idx) => ({
      centroid,
      children: points.filter((p) => this.findNearestCentroid(p, centroids) === idx),
    })).filter((c) => c.children.length > 0);
  }

  /**
   * Initialize centroids using k-means++ algorithm for better initial placement
   */
  private initializeCentroids(
    points: Array<{ lat: number; lon: number }>,
    k: number,
  ): Location[] {
    const centroids: Location[] = [];

    // First centroid: random point
    const firstIdx = Math.floor(Math.random() * points.length);
    centroids.push({ lat: points[firstIdx].lat, lon: points[firstIdx].lon });

    // Remaining centroids: choose points far from existing centroids
    for (let i = 1; i < k; i++) {
      const distances = points.map((point) => {
        const minDist = Math.min(...centroids.map((c) => this.distance(point, c)));
        return minDist * minDist; // Square for weighted probability
      });

      const totalDist = distances.reduce((sum, d) => sum + d, 0);
      const random = Math.random() * totalDist;

      let cumulative = 0;
      for (let j = 0; j < points.length; j++) {
        cumulative += distances[j];
        if (cumulative >= random) {
          centroids.push({ lat: points[j].lat, lon: points[j].lon });
          break;
        }
      }
    }

    return centroids;
  }

  /**
   * Find nearest centroid index for a point
   */
  private findNearestCentroid(point: Location, centroids: Location[]): number {
    let minDist = Infinity;
    let nearestIdx = 0;

    for (let i = 0; i < centroids.length; i++) {
      const dist = this.distance(point, centroids[i]);
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }

    return nearestIdx;
  }

  /**
   * Calculate centroid (average location) of a group of points
   */
  private calculateCentroid(points: Array<{ lat: number; lon: number }>): Location {
    const sum = points.reduce(
      (acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }),
      { lat: 0, lon: 0 },
    );

    return {
      lat: sum.lat / points.length,
      lon: sum.lon / points.length,
    };
  }

  /**
   * Calculate Haversine distance between two points (in km)
   */
  private distance(point1: Location, point2: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(point2.lat - point1.lat);
    const dLon = this.toRad(point2.lon - point1.lon);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(point1.lat)) *
        Math.cos(this.toRad(point2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  /**
   * Order stops by distance to target (school or centroid)
   * Nearest stops first for efficient pickup
   */
  private orderStops(
    children: Array<{ childId: string; lat: number; lon: number }>,
    target: Location,
  ): Array<{ childId: string; lat: number; lon: number }> {
    return children
      .map((child) => ({
        ...child,
        distanceToTarget: this.distance(child, target),
      }))
      .sort((a, b) => a.distanceToTarget - b.distanceToTarget)
      .map(({ childId, lat, lon }) => ({ childId, lat, lon }));
  }

  /**
   * Generate route labels: A, B, C, ... Z, AA, AB, ...
   */
  private generateRouteLabels(count: number): string[] {
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      labels.push(`Route ${this.numberToLetters(i)}`);
    }
    return labels;
  }

  /**
   * Convert number to letter sequence (0 -> A, 1 -> B, ..., 26 -> AA)
   */
  private numberToLetters(num: number): string {
    let result = '';
    while (true) {
      result = String.fromCharCode(65 + (num % 26)) + result;
      num = Math.floor(num / 26);
      if (num === 0) break;
      num--;
    }
    return result;
  }
}
