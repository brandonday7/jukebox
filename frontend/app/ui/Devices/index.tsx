import { styled } from "styled-components/native";
import Header from "../common/Header";

const Root = styled.View`
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: center;
  padding: 100px 20px 0 20px;
`;

const Devices = () => {
  return (
    <Root>
      <Header title="Devices" />
    </Root>
  );
};

export default Devices;
