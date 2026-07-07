import { useEffect, useState } from "react";
import { PlatformsService } from "../services/platformsService";
import { Platform } from "../types/platform";

export function usePlatforms() {
  const [activePlatforms, setActivePlatforms] = useState<Platform[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [platformError, setPlatformError] = useState("");

  useEffect(() => {
    let isMounted = true;

    PlatformsService.list()
      .then((response) => {
        if (!isMounted) {
          return;
        }

        setActivePlatforms(response.platforms);
        setPlatformError("");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setActivePlatforms([]);
        setPlatformError(
          error instanceof Error ? error.message : "Erro ao carregar plataformas."
        );
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function addPlatform(platformName: string) {
    const cleanName = platformName.trim().toUpperCase();

    if (!cleanName) {
      setPlatformError("Digite o nome da plataforma.");
      return false;
    }

    const exists = activePlatforms.some(
      (platform) => platform.toUpperCase() === cleanName
    );

    if (exists) {
      setPlatformError(`${cleanName} ja esta cadastrada.`);
      return false;
    }

    try {
      await PlatformsService.create(cleanName);
      setActivePlatforms((current) => [...current, cleanName]);
      setPlatformError("");
    } catch (error) {
      setPlatformError(error instanceof Error ? error.message : "Erro ao salvar plataforma.");
      return false;
    }

    return true;
  }

  async function removePlatform(platform: Platform) {
    await PlatformsService.remove(platform);
    setActivePlatforms((current) => current.filter((item) => item !== platform));
  }

  return { activePlatforms, addPlatform, isLoading, platformError, removePlatform };
}
