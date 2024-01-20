import React, { PropsWithChildren } from 'react';
import {Row, Button, Form, DropdownButton, Dropdown} from 'react-bootstrap';

interface PageHeaderProps extends PropsWithChildren {
	heading?: string;
};

const PageHeader: React.FC<PageHeaderProps> = ({heading, children}) => {
	return (
		<>
			<Row className='border-bottom p-2 position-sticky' style={{zIndex: 1000}}>
				<h3 className='d-flex align-items-center justify-content-between gap-2 mb-0'>
					<span className='py-1'>{heading}</span>
					<div className='d-flex gap-2 align-items-center justify-content-flex-end'>
						{children}
					</div>
				</h3>
			</Row>
		</>
	);
};

export default React.memo(PageHeader);
