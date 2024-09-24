/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/..\app-example\(tabs)\_layout` | `/..\app-example\+html` | `/..\app-example\+not-found` | `/..\app-example\_layout` | `/..\components\Collapsible` | `/..\components\ExternalLink` | `/..\components\HelloWave` | `/..\components\ParallaxScrollView` | `/..\components\ThemedText` | `/..\components\ThemedView` | `/..\components\navigation\TabBarIcon` | `/..\constants\Colors` | `/..\hooks\useColorScheme` | `/..\hooks\useColorScheme.web` | `/..\hooks\useThemeColor` | `/_sitemap` | `/account` | `/chats` | `/chatscreen` | `/createaccount` | `/friend` | `/homescreen` | `/login` | `/notification` | `/rough` | `/splash`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
