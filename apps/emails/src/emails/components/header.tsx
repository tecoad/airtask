import { Img, Link, Row, Section } from '@react-email/components';
import React from 'react';
import { ENV } from '../../utils/env';

const Header = () => {
	const { baseUrl } = ENV;
	return (
		<Section className="bg-brand py-5">
			<Row>
				<Link href="https://airtask.ai">
					<Img
						src={`${baseUrl}/static/logo-white.png`}
						width="150"
						alt="Airtask"
						className="-mb-1 mx-auto"
					/>
				</Link>
			</Row>
		</Section>
	);
};

export default Header;
