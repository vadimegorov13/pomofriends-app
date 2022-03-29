import { Box, List } from '@mui/material';
import { useEffect, useState } from 'react';
import { useGroup } from '../../hooks/useGroup';
import { useParticipants } from '../../hooks/useParticipants';
import { GroupParticipant } from '../../utils/types/groupTypes';
import DisplayParticipant from './Display';
import { ScrollArea } from '@mantine/core';

interface ParticipantsProps {
  groupId: string;
}

const Participants: React.FC<ParticipantsProps> = ({ groupId }) => {
  const { getParticipants } = useParticipants();
  const { getAdmin } = useGroup();

  const [participants, setParticipants] = useState<GroupParticipant[]>([]);
  const [adminId, setAdminId] = useState<string>('');

  // automatically check db for new participants
  useEffect(() => {
    let isSubscribed = true;

    getParticipants(groupId, setParticipants, isSubscribed);
    getAdmin(groupId, setAdminId, isSubscribed);

    return () => {
      isSubscribed = false;
    };
  }, []);

  return (
    <>
      <Box>
        <ScrollArea style={{ height: '36rem' }} offsetScrollbars>
          <List>
            {participants.map((participant: GroupParticipant) => {
              return (
                <div key={participant.id}>
                  {adminId === participant.id ? (
                    <DisplayParticipant
                      participant={participant}
                      admin={true}
                    />
                  ) : (
                    <DisplayParticipant participant={participant} />
                  )}
                </div>
              );
            })}
          </List>
        </ScrollArea>
      </Box>
    </>
  );
};

export default Participants;
