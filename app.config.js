export default {
  expo: {
    name: "NutriChat",
    slug: "nutrichat",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "dark",
    splash: {
      backgroundColor: "#0D0D0D",
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#0D0D0D",
      },
      package: "com.arnab.nutrichat",
    },
    plugins: ["expo-router"],
    scheme: "nutrichat",
    extra: {
      groqApiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
      router: {
        origin: false,
      },
      eas: {
        projectId: "c494bffc-4600-4aa7-93c9-613176100949",
      },
    },
  },
};
