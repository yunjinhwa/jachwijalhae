export function navigateStack(navigation: any, routeName: string, params?: Record<string, unknown>) {
  const parent = navigation.getParent?.();

  if (parent?.navigate) {
    parent.navigate(routeName, params);
    return;
  }

  navigation.navigate(routeName, params);
}
