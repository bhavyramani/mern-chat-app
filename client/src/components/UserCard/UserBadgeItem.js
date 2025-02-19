import { Badge, Text } from "@chakra-ui/react";
import { CloseButton } from "@chakra-ui/react";

const UserBadgeItem = ({ user, handleFunction, admin }) => {
  return (
    <Badge
      px={2}
      py={1}
      borderRadius="lg"
      m={1}
      mb={2}
      variant="solid"
      fontSize={12}
      colorScheme="purple"
      cursor="pointer"
      onClick={handleFunction}
    >
      <Text fontSize={'17px'}>
        {user.name}
      </Text>
      {admin === user._id && <span> (Admin)</span>}
      <CloseButton size={'xs'} />
    </Badge>
  );
};

export default UserBadgeItem;