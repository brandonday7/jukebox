import { styled } from "styled-components/native";
import Header from "../common/Header";
import { useUserState } from "@/state/userState";
import { useCallback, useEffect, useState } from "react";
import type { Device } from "@/api";
import Button from "../common/Button";
import { useFocusEffect } from "expo-router";
import { useThemeState } from "@/state/themeState";
import { lighter } from "../helpers/color";
import { usePlaybackState } from "@/state/playbackState";

const StyledScrollView = styled.ScrollView<{ color: string }>`
  background-color: ${({ color }) => color};
  padding-bottom: 80px;
`;

const Root = styled.View<{ playing: boolean }>`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;

  padding: 50px 20px 0 20px;
  padding-bottom: ${({ playing }) => (playing ? 95 : 15)}px;
`;

const HeadingWrapper = styled.View`
  width: 100%;
`;

const Heading = styled.Text`
  font-size: 20px;
  margin-bottom: 20px;
`;

const DeviceList = styled.View`
  width: 100%;
  gap: 10px;
`;

const DeviceItem = styled.TouchableOpacity<{ isSelected: boolean }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
  border-radius: 8px;
  border-width: 2px;
  border-color: ${({ isSelected }) => (isSelected ? "#007AFF" : "#e0e0e0")};
  background-color: ${({ isSelected }) => (isSelected ? "#f0f7ff" : "#ffffff")};
`;

const DeviceInfo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  flex: 1;
`;

const DeviceIcon = styled.Text`
  font-size: 24px;
`;

const DeviceDetails = styled.View`
  flex: 1;
`;

const DeviceName = styled.Text`
  font-size: 16px;
  font-weight: 600;
`;

const DeviceType = styled.Text`
  font-size: 14px;
  color: #666;
  margin-top: 2px;
`;

const DefaultIndicator = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #34c759;
`;

const StyledButton = styled(Button)`
  margin: 20px;
  width: 200px;
`;

const Devices = () => {
  const { devices, fetchDevices, setDefaultDevice, clearDevices } =
    useUserState();
  const { playing: playingRaw } = usePlaybackState();
  const playing = playingRaw === true;
  const { colorValues, defaultColor } = useThemeState();
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();
  const [defaultDeviceId, setDefaultDeviceId] = useState<string>();

  // Spotify's devices endpoint is pretty flaky. Whenever the screen comes into
  // focus, we'll need to refetch what devices are available in that moment.
  useFocusEffect(
    useCallback(() => {
      fetchDevices();

      return () => {
        clearDevices();
      };
    }, [fetchDevices, clearDevices])
  );

  useEffect(() => {
    if (devices && devices !== "loading") {
      const defaultDeviceId = devices.find(({ isDefault }) => isDefault)?.id;
      setDefaultDeviceId(defaultDeviceId);

      if (defaultDeviceId) {
        setSelectedDeviceId(defaultDeviceId);
      }
    }
  }, [devices]);

  const color = colorValues ? lighter(...colorValues, 0.2) : defaultColor;
  if (!devices || devices === "loading") {
    return (
      <Root playing={playing}>
        <Header title="Devices" />
      </Root>
    );
  }

  return (
    <StyledScrollView color={color}>
      <Root playing={playing}>
        <Header title="Devices" />
        <HeadingWrapper>
          <Heading>Select a device:</Heading>
        </HeadingWrapper>
        <DeviceList>
          {devices.map((device) => (
            <DeviceItem
              key={device.id}
              isSelected={selectedDeviceId === device.id}
              onPress={() => {
                setSelectedDeviceId(device.id);
              }}
            >
              <DeviceInfo>
                <DeviceIcon>{getDeviceIcon(device.type)}</DeviceIcon>
                <DeviceDetails>
                  <DeviceName>{device.name}</DeviceName>
                  <DeviceType>{device.type}</DeviceType>
                </DeviceDetails>
                {device.isDefault && <DefaultIndicator />}
              </DeviceInfo>
            </DeviceItem>
          ))}
        </DeviceList>
        <StyledButton
          title="Save"
          disabled={!selectedDeviceId || selectedDeviceId === defaultDeviceId}
          onPress={() => {
            if (selectedDeviceId) {
              setDefaultDevice(selectedDeviceId);
            }
          }}
        />
      </Root>
    </StyledScrollView>
  );
};

export default Devices;

const getDeviceIcon = (type: Device["type"]) => {
  switch (type) {
    case "Computer":
      return "💻";
    case "TV":
      return "📺";
    case "Smartphone":
      return "📱";
    default:
      return "🔊";
  }
};
