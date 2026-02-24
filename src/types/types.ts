// TypeScript type definitions for macOS Sonoma
window.MacTypes = {};

interface WindowData {
    id: string;
    title: string;
    appName: string;
    appType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    minimized: boolean;
    maximized: boolean;
    focused: boolean;
    zIndex: number;
    component: string;
}

interface AppConfig {
    name: string;
    type: string;
    icon: string;
    defaultWidth: number;
    defaultHeight: number;
    resizable: boolean;
    minWidth?: number;
    minHeight?: number;
}

interface Notification {
    id: string;
    app: string;
    title: string;
    body: string;
    time: Date;
    icon?: string;
}

window.MacTypes = { loaded: true };
