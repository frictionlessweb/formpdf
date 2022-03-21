/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import Heading from "./app/Heading";
import PDF from "./app/PDF";
import ToolSelect from "./app/ToolSelect";

const App = () => {
  return (
    <Box
      width="100%"
      display="flex"
      flexDirection="column"
      alignItems="center"
      paddingX="48px"
      paddingY="24px">
      <Heading paddingBottom="24px" />
      <Box display="flex" width="100%" justifyContent="center">
        <div css={{ width: "180px", paddingX: "16px" }} />
        <PDF width={600} height={600} url="/sample_form.pdf" />
        <ToolSelect width="180px" paddingX="16px" />
      </Box>
    </Box>
  );
};

export default App;
