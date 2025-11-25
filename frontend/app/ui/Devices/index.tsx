import { styled } from "styled-components/native";
import Header from "../common/Header";
import { useUserState } from "@/state/userState";
import { useCallback, useEffect, useState } from "react";
import type { Device } from "@/api";
import Button from "../common/Button";
import { useFocusEffect } from "expo-router";
import { useThemeState } from "@/state/themeState";
import { lighter } from "../helpers/color";
import { Linking, RefreshControl } from "react-native";
import { openSpotifyLink } from "../helpers/spotify";
import * as Haptics from "expo-haptics";

const StyledScrollView = styled.ScrollView<{ color: string }>`
  background-color: ${({ color }) => color};
  padding-bottom: 100px;
`;

const Root = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 50px 20px 15px 20px;
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

const Disclaimer = styled.View`
  gap: 10px;
  padding: 30px 50px 70px 50px;
`;

const DisclaimerText = styled.Text`
  text-align: center;
  font-size: 11px;
`;

const SpotifyApp = styled.TouchableOpacity`
  display: flex;
  width: 110px;
  padding: 10px;
  border-radius: 8px;
  background-color: #1db954;
  margin: auto;
`;
const SpotifyAppText = styled.Text`
  color: white;
  text-align: center;
  font-weight: 700;
`;

const Devices = () => {
  const { devices, fetchDevices, setDefaultDevice, clearDevices } =
    useUserState();
  const { colorValues, defaultColor } = useThemeState();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>();

  useEffect(() => {
    if (devices !== "loading" && !devices) {
      fetchDevices();
    }
  }, [devices, fetchDevices]);

  useEffect(() => {
    if (devices && devices !== "loading") {
      const defaultDeviceId = devices.find(({ isDefault }) => isDefault)?.id;

      if (defaultDeviceId) {
        setSelectedDeviceId(defaultDeviceId);
      }
    }
  }, [devices]);

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

  const color = colorValues ? lighter(...colorValues, 0.2) : defaultColor;

  return (
    <StyledScrollView
      color={color}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            setRefreshing(true);
            clearDevices();
            setTimeout(() => setRefreshing(false), 500);
          }}
        />
      }
    >
      <Root>
        <Header title="Devices" />
        {devices && devices !== "loading" ? (
          <>
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
              onPress={() => {
                if (selectedDeviceId) {
                  setDefaultDevice(selectedDeviceId);
                }
              }}
            />
            <Disclaimer>
              <DisclaimerText>
                Not seeing your device? You may need to make your device
                discoverable by opening Spotify
              </DisclaimerText>
              <SpotifyApp onPress={() => Linking.openURL(openSpotifyLink())}>
                <SpotifyAppText>Spotify app</SpotifyAppText>
              </SpotifyApp>
              <DisclaimerText>
                (it helps us discover your device if you initiate a few seconds
                of playback and then return here)
              </DisclaimerText>
            </Disclaimer>
          </>
        ) : null}
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
