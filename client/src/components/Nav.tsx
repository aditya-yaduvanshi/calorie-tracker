import React from 'react';
import {Navbar, Nav as BNav, Container, NavDropdown} from 'react-bootstrap';
import {NavLink} from 'react-router-dom';
import {useAuth} from '../contexts/auth';

const Nav: React.FC = () => {
	const {auth, signout} = useAuth();

	return (
		<>
			<Navbar
				bg='primary'
				expand='lg'
				color='white'
				fixed='top'
				className='shadow'
				style={{zIndex: 1001}}
			>
				<Container>
					<Navbar.Brand to={auth?.role === 'admin' ? '/dashboard' : '/'} as={NavLink} className='text-white'>
						Caler
					</Navbar.Brand>
					<Navbar.Collapse
						id='basic-navbar-nav'
						className='justify-content-end px-5'
					>
						<BNav className='ml-auto'>
							{auth && auth.role === 'admin' && (
								<>
									<BNav.Link
										to='/dashboard/users'
										as={NavLink}
										className='text-white'
									>
										Users
									</BNav.Link>
									<BNav.Link
										to='/dashboard/entries'
										as={NavLink}
										className='text-white'
									>
										Entries
									</BNav.Link>
								</>
							)}
						</BNav>
					</Navbar.Collapse>
					{auth ? (
						<NavDropdown
							title={`Signed In As ${auth.name}`}
							id='basic-nav-dropdown'
							className='text-white'
						>
							<NavDropdown.Item onClick={signout}>Sign Out</NavDropdown.Item>
						</NavDropdown>
					) : (
						<>
							<BNav.Link to='/signin' className='text-white mx-2' as={NavLink}>
								Sign In
							</BNav.Link>
							<BNav.Link
								to='/register'
								className='text-white mx-2'
								as={NavLink}
							>
								Register
							</BNav.Link>
						</>
					)}
					{auth && auth.role === 'admin' && (
						<Navbar.Toggle aria-controls='basic-navbar-nav' />
					)}
				</Container>
			</Navbar>
		</>
	);
};

export default React.memo(Nav);
