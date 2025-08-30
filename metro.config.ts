const { getDefaultConfig } = require("expo/metro-config");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.sourceExts.push("sql"); // <--- add this for drizzle sqlite

config.resolver.assetExts.push("bin"); // <--- Add bin to assetExts for tensorflow

module.exports = config;
