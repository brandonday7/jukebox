import { useEffect, useState } from "react";
import { Alert, TouchableWithoutFeedback } from "react-native";
import { Redirect } from "expo-router";
import { styled } from "styled-components/native";
import { useSystemState } from "@/state/systemState";

const APP_CODE = process.env.EXPO_PUBLIC_APP_CODE || "";

const Root = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  background-color: "#fff";
`;

const Title = styled.Text`
  font-size: 32px;
  margin-bottom: 20px;
`;

const StyledTextInput = styled.TextInput`
  font-size: 48px;
  width: 200px;
  text-align: center;
  border-bottom-width: 2px;
  border-bottom-color: "#000";
  letter-spacing: 20px;
`;

const Index = () => {
  const {
    passcode,
    setPasscode,
    fetchPasscode,
    fetchLoginAttempts,
    loginAttempts,
    setLoginAttempts,
    clearLogin,
  } = useSystemState();
  const [localCode, setLocalCode] = useState("");

  useEffect(() => {
    if (passcode === undefined && loginAttempts === undefined) {
      fetchPasscode();
      fetchLoginAttempts();
    }
  }, [fetchPasscode, fetchLoginAttempts, passcode, loginAttempts]);

  const authenticated = passcode === APP_CODE;

  if (passcode === undefined || loginAttempts === undefined) {
    return null;
  }

  if (authenticated && loginAttempts < 2) {
    return <Redirect href="/(tabs)/vibes" />;
  }

  return (
    <Root>
      <TouchableWithoutFeedback
        onLongPress={() => clearLogin()}
        delayLongPress={5000}
      >
        <Title>Enter Code</Title>
      </TouchableWithoutFeedback>
      <StyledTextInput
        value={localCode}
        onChangeText={(text: string) => {
          setLocalCode(text);

          if (text.length === 4) {
            if (text === APP_CODE) {
              setPasscode(text);
            } else {
              Alert.alert("Wrong Code", "Please try again");
              setLocalCode("");
              setLoginAttempts(loginAttempts + 1);
            }
          }
        }}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        autoFocus
        placeholder="****"
        editable={loginAttempts < 2}
      />
    </Root>
  );
};

export default Index;
