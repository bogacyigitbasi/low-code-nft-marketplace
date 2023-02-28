import { Button, ButtonGroup } from "@mui/material";
import { Stack } from "@mui/system";
import FileUpload from "react-material-file-upload";
import React from "react";

function UploadFiles(props: {
	files: File[];
	onDone: (files: File[]) => void;
}) {
	var [files, setFiles] = React.useState<File[]>(props.files);

	function onFilesChanged(files: File[]): void {
		setFiles(files);
	}

	return (
		<Stack spacing={2}>
			<FileUpload
				value={props.files}
				onChange={onFilesChanged}
				multiple={true}
				title={""}
				accept={[".jpg"]}
			/>
			<ButtonGroup fullWidth>
				<Button variant="contained" onClick={() => props.onDone(files)}>
					Done
				</Button>
			</ButtonGroup>
		</Stack>
	);
}

export default UploadFiles;
