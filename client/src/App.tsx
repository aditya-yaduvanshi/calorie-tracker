import React from 'react';
import {Container, Row} from 'react-bootstrap';
import {Routes, Route} from 'react-router-dom';
import Dashboard from './pages/dashboard';
import Home from './pages/home';
import Entries from './pages/entries';
import Users from './pages/users';
import Signin from './pages/signin';
import Nav from './components/Nav';
import EntriesProvider from './contexts/entries';
import UsersProvider from './contexts/users';
import AdminProvider from './contexts/admin';
import ProtectedOutlet from './hoc/ProtectedOutlet';
import PrivateOutlet from './hoc/PrivateOutlet';
import {useAuth} from './contexts/auth';
import Register from './pages/register';
import AlertProvider from './contexts/alerts';
import VerifyInvite from './pages/verify-invite';
import Password from './pages/password';

const App: React.FC = () => {
	return (
		<>
			<Container fluid>
				<Row className='position-relative'>
					<Nav />
				</Row>
				<Row>
					<Container className='py-5 px-md-3 px-lg-5 mt-3'>
						<AlertProvider>
							<Routes>
								<Route path='/' element={<PrivateOutlet />}>
									<Route
										index
										element={
											<EntriesProvider>
												<Home />
											</EntriesProvider>
										}
									/>
									<Route path='/dashboard' element={<ProtectedOutlet />}>
										<Route
											path=''
											element={
												<AdminProvider>
													<Dashboard />
												</AdminProvider>
											}
										/>
										<Route
											path='entries'
											element={
												<EntriesProvider>
													<Entries />
												</EntriesProvider>
											}
										/>
										<Route
											path='users'
											element={
												<UsersProvider>
													<Users />
												</UsersProvider>
											}
										/>
									</Route>
								</Route>
								<Route path='/signin' element={<Signin />} />
								<Route path='/register' element={<Register />} />
								<Route path='/verify-invitation' element={<VerifyInvite />} />
								<Route path='/password' element={<Password />} />
								<Route
									path='*'
									element={<h1 className='text-center'>404 NOT FOUND</h1>}
								/>
							</Routes>
						</AlertProvider>
					</Container>
				</Row>
			</Container>
		</>
	);
};

export default React.memo(App);
