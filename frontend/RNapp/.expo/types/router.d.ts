/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\app-example\_layout` | `/..\hooks\useColorScheme.web` | `/..\hooks\useThemeColor` | `/_sitemap` | `/account` | `/chats` | `/chatscreen` | `/createaccount` | `/friend` | `/homescreen` | `/login` | `/notification` | `/rough` | `/splash`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
