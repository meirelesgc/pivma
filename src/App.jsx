import { Flex, Typography, Button } from 'antd';
import './App.css';

const { Title, Paragraph } = Typography;

function App() {
  return <Flex justify="center" align="center" vertical gap="middle">
    <Typography>
      <Title>Recepção</Title>
      <Paragraph>Acesse o sistema.</Paragraph>
    </Typography>
    <Button type="primary">Entrar</Button>
  </Flex>
}

export default App;