import { useSystemState } from "@/state/systemState";
import { useEffect, type ReactNode } from "react";
import { styled } from "styled-components/native";

const LoadingMessage = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
  margin-top: -100px;
  gap: 10px;
`;

const LoadingText = styled.Text`
  text-align: center;
`;

interface Props {
  children: ReactNode;
}

const SystemContext = ({ children }: Props) => {
  const { awake, awakeServer, countdown, setCountdown } = useSystemState();

  useEffect(() => {
    if (!awake) {
      awakeServer();
    }
  }, [awake, awakeServer]);

  useEffect(() => {
    if (!awake) {
      setTimeout(() => setCountdown(countdown - 1), 1000);
    }
  }, [awake, setCountdown, countdown]);

  if (!awake && countdown < 47) {
    return (
      <>
        <LoadingMessage>
          <LoadingText>
            Jukebox is connecting to its free server, which needs to restart
            after long periods of inactivity.
          </LoadingText>
          {countdown > 1 ? (
            <LoadingText>
              This may take up to {countdown} seconds ...
            </LoadingText>
          ) : countdown === 1 ? (
            <LoadingText>This may take up to 1 second</LoadingText>
          ) : (
            <LoadingText>This is taking longer than usual...</LoadingText>
          )}
        </LoadingMessage>
      </>
    );
  } else {
    return <>{children}</>;
  }
};

export default SystemContext;
