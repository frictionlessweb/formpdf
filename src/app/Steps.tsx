/** @jsxImportSource @emotion/react */
import { styled } from "@mui/material/styles";
import Box, { BoxProps } from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { StepIconProps } from "@mui/material/StepIcon";

const STEPS = [
  {
    id: 0,
    title: "Section",
    description:
      "Mark the area you want to fix first. We will go through the form in small chunks. Ensure that fields or groups (radioboxes) are completely included and not cut off in half .",
  },
  {
    id: 1,
    title: "Fields",
    description:
      "Ensure all form fields have a box and a field type present on them. If not, draw a box using the mouse and assign the field type.",
  },
  {
    id: 2,
    title: "Labels",
    description:
      "Ensure all form fields have a label associated to them. If not, select the field and use update label from the popup.",
  },
  {
    id: 3,
    title: "Groups",
    description:
      "Ensure the checkbox and radiobox are grouped properly and have group names. If not, you can select multiple boxes by dragging or Shift+Click and use popup menu to group fields. ",
  },
  {
    id: 4,
    title: "Tooltips",
    description:
      "Ensure these field descriptions (tooltips) are sufficient. If needed, add more information about the field using the edit button.",
  },
];

// styled is a part of mui and is a recommendation for reusable style overrides.
// Ref: https://mui.com/customization/how-to-customize/#2-reusable-style-overrides
const Connector = styled(StepConnector)(() => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 10,
    left: "calc(-50% + 16px)",
    right: "calc(50% + 16px)",
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#1473E6",
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#1473E6",
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    borderColor: "#eaeaf0",
    borderTopWidth: 3,
    borderRadius: 1,
  },
}));

const StepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
  ({ theme, ownerState }) => ({
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: "#1473E6",
    }),
    "& .StepIcon-completedIcon": {
      color: "#1473E6",
      zIndex: 1,
      fontSize: 18,
    },
    "& .StepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  })
);

function StepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  return (
    <StepIconRoot ownerState={{ active }} className={className}>
      {completed ? (
        <Check className="StepIcon-completedIcon" />
      ) : (
        <div className="StepIcon-circle" />
      )}
    </StepIconRoot>
  );
}

const Steps: React.FC<
  BoxProps & { activeStep: number; onStepChange: (step: number) => void }
> = (props) => {
  const { activeStep, onStepChange, ...boxProps } = props;
  //BUG: is not boxProps inline style ?
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      width="100%"
      {...boxProps}>
      <Stepper
        css={{ width: "600px" }}
        alternativeLabel
        activeStep={activeStep}
        connector={<Connector />}>
        {STEPS.map((step) => (
          <Step key={step.title}>
            <StepLabel StepIconComponent={StepIcon}>
              <span
                css={{
                  cursor: "pointer",
                  "&:hover": {
                    fontWeight: "bold",
                  },
                }}
                onClick={() => onStepChange(step.id)}>
                {step.title}
              </span>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
      <div css={{ marginTop: "20px", fontWeight: "bold", textAlign: "center" }}>
        {STEPS[activeStep].description}
      </div>
    </Box>
  );
};
export default Steps;
