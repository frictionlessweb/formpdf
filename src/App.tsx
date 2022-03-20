/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import Heading from "./app/Heading";
import PDF from "./app/PDF";
import Annotation from "./app/Annotation";

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
      <PDF
        width={600}
        height={600}
        currentPage={1}
        zoom={1}
        url="/sample_form.pdf">
        <Annotation
          id="1"
          draggable={true}
          resizable={false}
          zoom={1}
          top={0}
          left={0}
          width={50}
          height={50}
          backgroundColor="hotpink"
        />
      </PDF>
    </Box>
  );
};

export default App;
