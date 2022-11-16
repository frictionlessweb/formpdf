/** @jsxImportSource @emotion/react */
import Box from "@mui/material/Box";
import StepsNav from "./app/StepsNav";
import PDF from "./app/PDF";
import Zoom from "./app/Zoom";
import ToolSelect from "./app/ToolSelect";
import ResizeDialog from "./app/ResizeModal";
import { useSaveState, getPdfUrl } from "./app/utils";
import ProceedToNextLayer from "./app/ProceedToNextLayer";
import color from "./components/color";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FormControl } from "@mui/material";
import Fab from "@mui/material/Fab";
import ClearIcon from "@mui/icons-material/Clear";
import { useSelector, useDispatch } from "./app/StoreProvider";

const Logo = () => {
  return (
    <Box position="fixed" left="24px" top="24px">
      <img src="/logo.svg" alt="logo of FormA11y" />
    </Box>
  );
};

const FormSelect = () => {
  // we cannot use useState here as we are reloading the page and clearing state
  // and all information will be lost this way.
  const currentForm =
    window.location.hash === "" ? "1" : window.location.hash.substring(1);
  return (
    <Box position="fixed" left="24px" top="24px" zIndex={110}>
      <FormControl size="small">
        <Select
          value={currentForm}
          onChange={(e) => {
            window.location.href =
              window.location.origin + "#" + e.target.value;
            // we clear the current state present in local storage, when page is reloaded new state is loaded automatically from the URL.
            window.localStorage.clear();
            window.location.reload();
          }}
          displayEmpty
          inputProps={{ "aria-label": "Without label" }}>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

const ExitButtonForCreateTool = () => {
  const [step, tool] = useSelector((state) => [state.step, state.tool]);
  const dispatch = useDispatch();
  const showCancelButton = step === "LABEL_LAYER" && tool === "CREATE";
  // TODO : We need to think about how to handle GROPU_LAYER here as when
  // user moves CREATE tool a gropu is already created so we need to undo that as well.
  // (step === "LABEL_LAYER" || step === "GROUP_LAYER") && tool === "CREATE";
  return (
    <>
      {showCancelButton && (
        <Fab
          sx={{
            position: "absolute",
            top: "8rem",
            left: "50%",
          }}
          size="medium"
          color="primary"
          aria-label="cancel"
          onClick={() => {
            dispatch({ type: "CHANGE_TOOL", payload: "SELECT" });
          }}>
          <ClearIcon />
        </Fab>
      )}
    </>
  );
};

const App = () => {
  useSaveState();
  const pdfUrl = getPdfUrl();
  return (
    <Box
      width="100%"
      height="100vh"
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ backgroundColor: color.gray.dark }}>
      <StepsNav />
      <ToolSelect />
      <Box
        display="flex"
        justifyContent="flex-start"
        marginTop="0.4rem"
        marginLeft="8rem">
        <PDF url={pdfUrl} />
      </Box>
      <ExitButtonForCreateTool />
      <Zoom />
      {/* <Logo /> */}
      <FormSelect />
      <ResizeDialog />
    </Box>
  );
};

export default App;
