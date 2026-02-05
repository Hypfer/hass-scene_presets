
// Loads in ha-config-dashboard which is used to copy styling
// Also provides ha-settings-row
export const loadConfigDashboard = async () => {
    await customElements.whenDefined("partial-panel-resolver");
    const ppResolver = document.createElement("partial-panel-resolver");

    let getRoutes = (ppResolver as any)._getRoutes; // After HA 2025.1
    if (typeof getRoutes !== "function") { // Before HA 2025.1
        getRoutes = (ppResolver as any).getRoutes;
    }

    const routes = getRoutes([
        {
            component_name: "config",
            url_path: "a",
        },
        {
            component_name: "developer-tools",
            url_path: "b",
        },
    ]);
    await routes?.routes?.a?.load?.();
    await customElements.whenDefined("ha-panel-config");
    const configRouter: any = document.createElement("ha-panel-config");
    await configRouter?.routerOptions?.routes?.dashboard?.load?.(); // Load ha-config-dashboard
    await configRouter?.routerOptions?.routes?.general?.load?.(); // Load ha-settings-row
    await configRouter?.routerOptions?.routes?.entities?.load?.(); // Load ha-data-table
    await customElements.whenDefined("ha-config-dashboard");


    // For the selectors
    await routes?.routes?.b?.load?.(); //  Before 2026.2, the devtools are their own route
    await configRouter?.routerOptions?.routes?.["developer-tools"]?.load?.(); // After HA 2026.2, the devtools are a sub-route of the config

    await customElements.whenDefined("ha-panel-developer-tools");
    const devToolsRouter: any = document.createElement("developer-tools-router");
    await devToolsRouter?.routerOptions?.routes?.service?.load?.(); // Home assistant before 2024.8 => service
    await devToolsRouter?.routerOptions?.routes?.action?.load?.(); // Home assistant after 2024.8 => action
};
