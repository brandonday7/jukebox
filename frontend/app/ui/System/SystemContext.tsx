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

  if (!awake && countdown < 57) {
    return (
      <>
        <LoadingMessage>
          <LoadingText>
            Jukebox is connecting to its free server, which needs to restart
            after long periods of inactivity.
          </LoadingText>
          <LoadingText>
            This may take up to {countdown}{" "}
            {countdown === 1 ? "second" : "seconds"}
            ...
          </LoadingText>
        </LoadingMessage>
      </>
    );
  } else {
    return <>{children}</>;
  }
};

export default SystemContext;
