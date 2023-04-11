import { Alert } from "@mui/material";

function DisplayError(props: { error?: string }) {
	const { error } = props;

	return error ? <Alert severity="error">{error}</Alert> : <></>;
}

export default DisplayError;
