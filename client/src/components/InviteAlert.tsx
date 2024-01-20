import React, {useState} from 'react';
import {Alert, Button} from 'react-bootstrap';
import {Link} from 'react-router-dom';

interface InviteAlertProps {
	inviteToken: string;
}

const InviteAlert: React.FC<InviteAlertProps> = ({inviteToken}) => {
	const [copied, setCopied] = useState(false);

	return (
		<>
			<Alert variant='success'>
				Please share this link to verify invitation.
				<hr />
				<Alert.Link
					as={Link}
					target='_blank'
					to={`/verify-invitation?inviteToken=${inviteToken}`}
					style={{wordWrap: 'break-word'}}
				>
					{`${window.location.origin}/verify-invitation?inviteToken=${inviteToken}`}
				</Alert.Link>
				<hr />
				<div className='text-center my-3'>OR</div>
				<div className='d-flex justify-content-between gap-2'>
					<Button
						onClick={() => {
							navigator.clipboard.writeText(
								`${window.location.origin}/verify-invitation?inviteToken=${inviteToken}`
							);
							setCopied(true);
						}}
					>
						{copied ? 'Copied' : 'Copy'}
					</Button>

					<Alert.Link as={Link} to={`/verify-invitation?inviteToken=${inviteToken}`}>
						<Button variant='success'>Verify Invitation</Button>
					</Alert.Link>
				</div>
			</Alert>
		</>
	);
};

export default React.memo(InviteAlert);
