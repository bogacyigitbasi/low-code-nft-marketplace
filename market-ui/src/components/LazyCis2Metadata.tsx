import React, { useEffect, useState } from "react";
import { Metadata, MetadataUrl } from "../models/Cis2Types";
import { fetchJsonString } from "../models/Utils";

function LazyCis2Metadata(props: {
	metadataUrl: MetadataUrl;
	loadingTemplate: () => React.ReactElement;
	loadedTemplate: (metadata: Metadata) => React.ReactElement;
	errorLoadingTemplate: (error: string) => React.ReactElement;
	onMetadataLoaded?: (metadata: string) => void;
}) {
	const [state, setState] = useState<{
		metadata?: Metadata;
		loadingMetadata: boolean;
		error: string;
	}>({ loadingMetadata: false, error: "" });

	useEffect(() => {
		setState({ ...state, loadingMetadata: true });
		fetchJsonString(props.metadataUrl.url)
			.then((metadata) => {
				setState({ ...state, metadata: JSON.parse(metadata), loadingMetadata: false });
				props.onMetadataLoaded && props.onMetadataLoaded(metadata);
			})
			.catch((err) => {
				setState({
					...state,
					loadingMetadata: false,
					error: err.message,
				});
			});
	}, [props.metadataUrl.url]);

	if (state.error) {
		return props.errorLoadingTemplate(state.error.toString());
	} else if (state.loadingMetadata) {
		return props.loadingTemplate();
	} else if (state.metadata) {
		return props.loadedTemplate(state.metadata);
	} else {
		return <></>;
	}
}

export default LazyCis2Metadata;
