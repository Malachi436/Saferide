declare module "react-native-reanimated" {
  import { ComponentType, ReactNode } from "react";
  import { ViewProps, StyleProp, ViewStyle, TextStyle, ImageStyle } from "react-native";

  // Basic types
  export type SharedValue<T> = { value: T };
  export type AnimatedStyleProp<T> = StyleProp<T> | AnimatedNode<T> | ReadonlyArray<AnimatedStyleProp<T>>;
  
  // Animated Node
  export interface AnimatedNode<T> {
    __value: T;
  }

  // Main hooks
  export function useSharedValue<T>(initialValue: T): SharedValue<T>;
  export function useAnimatedStyle<T extends StyleProp<ViewStyle | TextStyle | ImageStyle>>(
    updater: () => T,
    dependencies?: any[]
  ): T;
  export function useAnimatedProps<T>(updater: () => Partial<T>, dependencies?: any[]): Partial<T>;
  export function useDerivedValue<T>(updater: () => T, dependencies?: any[]): SharedValue<T>;
  export function useAnimatedReaction<D>(
    prepare: () => D,
    react: (data: D, previous: D | null) => void,
    dependencies?: any[]
  ): void;

  // Animation functions
  export function withTiming<T extends number | string>(
    toValue: T,
    userConfig?: { duration?: number; easing?: (value: number) => number },
    callback?: (finished: boolean) => void
  ): T;
  export function withSpring<T extends number>(
    toValue: T,
    userConfig?: {
      damping?: number;
      mass?: number;
      stiffness?: number;
      overshootClamping?: boolean;
      restDisplacementThreshold?: number;
      restSpeedThreshold?: number;
    },
    callback?: (finished: boolean) => void
  ): T;
  export function withDecay(
    userConfig: {
      velocity: number;
      deceleration?: number;
      clamp?: [number, number];
    },
    callback?: (finished: boolean) => void
  ): number;
  export function cancelAnimation<T>(sharedValue: SharedValue<T>): void;
  export function delay<T>(delayMs: number, delayedAnimation: T): T;
  export function sequence<T>(...animations: T[]): T;
  export function repeat<T>(
    animation: T,
    numberOfRepetitions?: number,
    reverse?: boolean,
    callback?: (finished: boolean) => void
  ): T;

  // Worklets
  export function runOnUI<A extends any[], R>(fn: (...args: A) => R): (...args: A) => void;
  export function runOnJS<A extends any[], R>(fn: (...args: A) => R): (...args: A) => void;
  export function processColor(color: number | string): number;
  export function createWorklet<A extends any[], R>(fn: (...args: A) => R): (...args: A) => R;

  // Gesture handlers
  export interface PanGestureHandlerGestureEvent {
    nativeEvent: {
      absoluteX: number;
      absoluteY: number;
      x: number;
      y: number;
      translationX: number;
      translationY: number;
      velocityX: number;
      velocityY: number;
    };
  }

  // Components
  export const View: ComponentType<ViewProps & { style?: AnimatedStyleProp<ViewStyle> }>;
  export const Text: ComponentType<ViewProps & { style?: AnimatedStyleProp<TextStyle> }>;
  export const Image: ComponentType<ViewProps & { style?: AnimatedStyleProp<ImageStyle> }>;
  export const ScrollView: ComponentType<ViewProps & { style?: AnimatedStyleProp<ViewStyle> }>;

  // Animated transitions
  export interface EntryAnimationsValues {
    targetOriginX: number;
    targetOriginY: number;
    targetWidth: number;
    targetHeight: number;
    targetGlobalOriginX: number;
    targetGlobalOriginY: number;
  }

  export interface ExitAnimationsValues {
    currentOriginX: number;
    currentOriginY: number;
    currentWidth: number;
    currentHeight: number;
    currentGlobalOriginX: number;
    currentGlobalOriginY: number;
  }

  export type EntryExitAnimationFunction = (
    targetValues: EntryAnimationsValues
  ) => {
    initialValues: { [key: string]: number };
    animations: { [key: string]: number };
  };

  export type LayoutAnimationFunction = (
    targetValues: EntryAnimationsValues & ExitAnimationsValues
  ) => {
    initialValues: { [key: string]: number };
    animations: { [key: string]: number };
  };

  // Layout Animations
  export function SlideInLeft: EntryExitAnimationFunction;
  export function SlideInRight: EntryExitAnimationFunction;
  export function SlideInUp: EntryExitAnimationFunction;
  export function SlideInDown: EntryExitAnimationFunction;
  export function SlideOutLeft: EntryExitAnimationFunction;
  export function SlideOutRight: EntryExitAnimationFunction;
  export function SlideOutUp: EntryExitAnimationFunction;
  export function SlideOutDown: EntryExitAnimationFunction;

  export function FadeIn: EntryExitAnimationFunction;
  export function FadeOut: EntryExitAnimationFunction;

  export function Layout: LayoutAnimationFunction;

  // Layout Animations Provider
  export const LayoutAnimationRepository: {
    register: (name: string, animation: LayoutAnimationFunction) => void;
    get: (name: string) => LayoutAnimationFunction;
  };

  // Default export
  export default {
    useSharedValue,
    useAnimatedStyle,
    useAnimatedProps,
    useDerivedValue,
    useAnimatedReaction,
    withTiming,
    withSpring,
    withDecay,
    cancelAnimation,
    delay,
    sequence,
    repeat,
    runOnUI,
    runOnJS,
    processColor,
    createWorklet,
    View,
    Text,
    Image,
    ScrollView,
    SlideInLeft,
    SlideInRight,
    SlideInUp,
    SlideInDown,
    SlideOutLeft,
    SlideOutRight,
    SlideOutUp,
    SlideOutDown,
    FadeIn,
    FadeOut,
    Layout,
    LayoutAnimationRepository,
  };
}