import React, {useEffect} from 'react';
import {Card, Col, Container, Row, Table} from 'react-bootstrap';
import PageHeader from '../components/PageHeader';
import {useAdmin} from '../contexts/admin';

const Day = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const Dashboard: React.FC = () => {
	const {report, getReport} = useAdmin();

	useEffect(() => {
		if (!report) getReport();
	}, []);

	return (
		<>
			<PageHeader heading='Dashboard' />
			<Row className='py-4'>
				<Col>
					<Card>
						<Card.Header>
							<Card.Title>Entries this week</Card.Title>
						</Card.Header>
						<Card.Body>
							<Card.Text className='fs-1'>{report?.thisWeekEntries}</Card.Text>
						</Card.Body>
					</Card>
				</Col>
				<Col>
					<Card>
						<Card.Header>
							<Card.Title>Entries previous week</Card.Title>
						</Card.Header>
						<Card.Body>
							<Card.Text className='fs-1'>{report?.lastWeekEntries}</Card.Text>
						</Card.Body>
					</Card>
				</Col>
			</Row>
			<Row className='py-4'>
				<h2>Average Calories Per Day Per User</h2>
				<Container>
					{report &&
						report.averageCaloriesPerDayPerUser.map((avg, index) => (
							<Row>
								<Col>
									<Card>
										<Card.Header>
											<Card.Title>User</Card.Title>
										</Card.Header>
										<Card.Body>
											<Card.Text>
												<span>Name</span> - <strong>{avg.user.name}</strong>
											</Card.Text>
											<Card.Text>
												<span>Email</span> - <strong>{avg.user.email}</strong>
											</Card.Text>
										</Card.Body>
									</Card>
								</Col>
								<Col>
									<Card>
										<Card.Header>
											<Card.Title>Average Calories</Card.Title>
										</Card.Header>
										<Card.Body>
											{avg.caloriesPerDay.map((day, dindex) => {
												let date = new Date(day.date);
												return (
												<Card.Text key={dindex}>
													<span>{`${
														new Date(day.date).toISOString().split('T')[0]
													} (${Day[new Date(day.date).getDay()]})`}</span>
													- <strong>{day.calories}</strong>
												</Card.Text>
											)})}
										</Card.Body>
									</Card>
								</Col>
							</Row>
						))}
				</Container>
			</Row>
		</>
	);
};

export default React.memo(Dashboard);
