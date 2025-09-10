import gql from 'graphql-tag';

export const UPLOAD_FILE = gql`
	mutation UploadFile($file: Upload!) {
		uploadFile(file: $file) {
			id
			url
			width
			height
		}
	}
`;
