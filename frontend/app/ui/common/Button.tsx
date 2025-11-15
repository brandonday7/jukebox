import type { ViewStyle } from "react-native";
import { styled } from "styled-components/native";

const Root = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#eee" : "#007AFF")};
  padding: 20px;
  border-radius: 8px;
  align-items: center;
`;

const ButtonText = styled.Text<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? "#aaa" : "white")};
  font-size: 18px;
  font-weight: 600;
`;

const ButtonDescription = styled.Text`
  color: white;
  font-size: 14px;
  margin-top: 5px;
  opacity: 0.9;
`;

interface Props {
  onPress(): void;
  disabled?: boolean;
  title: string;
  description?: string;
  style?: ViewStyle;
}

const Button = ({ onPress, disabled, title, description, style }: Props) => (
  <Root style={style} onPress={onPress} disabled={disabled}>
    <ButtonText disabled={disabled}>{title}</ButtonText>
    {description ? <ButtonDescription>{description}</ButtonDescription> : null}
  </Root>
);

export default Button;

interface TextButtonProps {
  onPress(): void;
  disabled?: boolean;
  title: string;
  style?: ViewStyle;
}

const TextButtonRoot = styled.TouchableOpacity``;

const TextButtonText = styled.Text<{ disabled?: boolean }>`
  color: ${({ disabled }) => (disabled ? "#cccccc" : "#007AFF")};
  font-size: 18px;
  font-weight: 600;
`;

export const TextButton = ({
  onPress,
  disabled,
  title,
  style,
}: TextButtonProps) => (
  <TextButtonRoot style={style} onPress={onPress} disabled={disabled}>
    <TextButtonText disabled={disabled}>{title}</TextButtonText>
  </TextButtonRoot>
);
