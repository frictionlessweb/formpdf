import Box from "@mui/material/Box";
import Heading from "./components/Heading";
import PDF from "./components/PDF";

const App = () => {
  return (
    <Box width="100%" display="flex" flexDirection="column" padding="1em">
      <Heading />
      <PDF zoom={1} url="/" />
    </Box>
  );
};

export default App;
