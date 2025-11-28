declare module "react-native-gesture-handler" {
  import { ViewProps } from "react-native";
  
  export interface GestureHandlerRootViewProps extends ViewProps {
    children: React.ReactNode;
  }
  
  export const GestureHandlerRootView: React.ComponentType<GestureHandlerRootViewProps>;
}