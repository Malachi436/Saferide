"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RouteAutoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteAutoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let RouteAutoService = RouteAutoService_1 = class RouteAutoService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(RouteAutoService_1.name);
    }
    async autoGenerateRoutes(schoolId) {
        this.logger.log(`Starting auto-route generation for school ${schoolId}`);
        const children = await this.prisma.child.findMany({
            where: {
                schoolId,
                pickupLatitude: { not: null },
                pickupLongitude: { not: null },
            },
        });
        if (children.length === 0) {
            throw new common_1.BadRequestException('No children with pickup locations found for this school');
        }
        this.logger.log(`Found ${children.length} children with pickup locations`);
        const school = await this.prisma.school.findUnique({
            where: { id: schoolId },
        });
        if (!school) {
            throw new common_1.BadRequestException('School not found');
        }
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
            throw new common_1.BadRequestException('No buses available. Please add buses first.');
        }
        const avgCapacity = Math.floor(buses.reduce((sum, bus) => sum + bus.capacity, 0) / buses.length);
        const targetChildrenPerRoute = Math.max(10, Math.floor(avgCapacity * 0.8));
        this.logger.log(`Average bus capacity: ${avgCapacity}, target children per route: ${targetChildrenPerRoute}`);
        const numRoutes = Math.max(1, Math.ceil(children.length / targetChildrenPerRoute));
        this.logger.log(`Creating ${numRoutes} routes for ${children.length} children`);
        const childLocations = children.map((child) => ({
            childId: child.id,
            lat: child.pickupLatitude,
            lon: child.pickupLongitude,
        }));
        const clusters = this.kMeansClustering(childLocations, numRoutes);
        const createdRoutes = [];
        const routeLabels = this.generateRouteLabels(numRoutes);
        for (let i = 0; i < clusters.length; i++) {
            const cluster = clusters[i];
            const routeName = routeLabels[i];
            const orderedStops = this.orderStops(cluster.children, school.latitude && school.longitude
                ? { lat: school.latitude, lon: school.longitude }
                : cluster.centroid);
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
            this.logger.log(`Created ${routeName} with ${cluster.children.length} stops for ${cluster.children.length} children`);
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
    kMeansClustering(points, k) {
        const maxIterations = 100;
        const tolerance = 0.0001;
        let centroids = this.initializeCentroids(points, k);
        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const clusters = centroids.map((centroid) => ({
                centroid,
                children: [],
            }));
            for (const point of points) {
                const nearestClusterIdx = this.findNearestCentroid(point, centroids);
                clusters[nearestClusterIdx].children.push(point);
            }
            const nonEmptyClusters = clusters.filter((c) => c.children.length > 0);
            const newCentroids = nonEmptyClusters.map((cluster) => this.calculateCentroid(cluster.children));
            const hasConverged = centroids.every((oldCentroid, idx) => {
                if (idx >= newCentroids.length)
                    return true;
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
    initializeCentroids(points, k) {
        const centroids = [];
        const firstIdx = Math.floor(Math.random() * points.length);
        centroids.push({ lat: points[firstIdx].lat, lon: points[firstIdx].lon });
        for (let i = 1; i < k; i++) {
            const distances = points.map((point) => {
                const minDist = Math.min(...centroids.map((c) => this.distance(point, c)));
                return minDist * minDist;
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
    findNearestCentroid(point, centroids) {
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
    calculateCentroid(points) {
        const sum = points.reduce((acc, p) => ({ lat: acc.lat + p.lat, lon: acc.lon + p.lon }), { lat: 0, lon: 0 });
        return {
            lat: sum.lat / points.length,
            lon: sum.lon / points.length,
        };
    }
    distance(point1, point2) {
        const R = 6371;
        const dLat = this.toRad(point2.lat - point1.lat);
        const dLon = this.toRad(point2.lon - point1.lon);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(point1.lat)) *
                Math.cos(this.toRad(point2.lat)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    toRad(degrees) {
        return (degrees * Math.PI) / 180;
    }
    orderStops(children, target) {
        return children
            .map((child) => ({
            ...child,
            distanceToTarget: this.distance(child, target),
        }))
            .sort((a, b) => a.distanceToTarget - b.distanceToTarget)
            .map(({ childId, lat, lon }) => ({ childId, lat, lon }));
    }
    generateRouteLabels(count) {
        const labels = [];
        for (let i = 0; i < count; i++) {
            labels.push(`Route ${this.numberToLetters(i)}`);
        }
        return labels;
    }
    numberToLetters(num) {
        let result = '';
        while (true) {
            result = String.fromCharCode(65 + (num % 26)) + result;
            num = Math.floor(num / 26);
            if (num === 0)
                break;
            num--;
        }
        return result;
    }
};
exports.RouteAutoService = RouteAutoService;
exports.RouteAutoService = RouteAutoService = RouteAutoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RouteAutoService);
//# sourceMappingURL=route-auto.service.js.map