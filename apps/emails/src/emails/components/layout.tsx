import { Body, Container, Head, Html, Tailwind } from '@react-email/components';
import React from 'react';
import { WithLanguageCode } from '../../utils/types';
import { Fonts } from './fonts';
import Footer from './footer';
import Header from './header';

interface Props {
	children: React.ReactNode;
}

const Layout = ({ children, languageCode }: WithLanguageCode<Props>) => {
	return (
		<Tailwind
			config={{
				theme: {
					fontFamily: {
						display: ['CharlieDisplay', 'Helvetica', 'sans-serif'],
						body: ['CharlieText', 'Helvetica', 'sans-serif'],
					},
					extend: {
						colors: {
							brand: '#0470ff',
							brandLighter: '#4397F7',
							brandSecondary: '#CB3A8B',
							brandDark: '#1F2839',
						},
					},
				},
			}}>
			<Html>
				<Head />
				<Fonts />

				<Body className="bg-[#FAFAFA] m-0 p-0 font-body">
					<Container className="lg:mt-10  w-full mx-auto max-w-none lg:max-w-[500px] overflow-hidden">
						<Header />
						<Container className="bg-white pb-5 px-6 lg:px-4 lg:rounded-b-lg  max-w-none ">
							{children}
						</Container>
						<Footer languageCode={languageCode} />
					</Container>
				</Body>
			</Html>
		</Tailwind>
	);
};

export default Layout;
