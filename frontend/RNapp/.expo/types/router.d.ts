/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/(tabs)\_layout` | `/..\app-example\(tabs)\_layout` | `/_sitemap` | `/splash`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
