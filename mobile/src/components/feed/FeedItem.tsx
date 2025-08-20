import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Avatar,
  Badge,
  Image,
} from 'native-base';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {FeedItem as FeedItemType} from '../../store/slices/feedSlice';

interface FeedItemProps {
  item: FeedItemType;
  onPress?: () => void;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
}

const FeedItem: React.FC<FeedItemProps> = ({
  item,
  onPress,
  onLike,
  onComment,
  onShare,
}) => {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleLike = () => {
    if (onLike) onLike();
  };

  const handleComment = () => {
    if (onComment) onComment();
  };

  const handleShare = () => {
    if (onShare) onShare();
  };

  return (
    <Pressable onPress={onPress}>
      <Box bg="white" rounded="lg" shadow={1} overflow="hidden">
        {/* Header */}
        <HStack p={4} space={3} alignItems="center">
          <Avatar size="sm" bg="primary.500">
            {item.author.charAt(0)}
          </Avatar>
          <VStack flex={1}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.800">
              {item.author}
            </Text>
            <HStack space={2} alignItems="center">
              <Text fontSize="xs" color="gray.500">
                {formatTimeAgo(item.publishedAt)}
              </Text>
              {item.location && (
                <>
                  <Icon name="location-on" size={12} color="#666" />
                  <Text fontSize="xs" color="gray.500">
                    {item.location.city}
                  </Text>
                </>
              )}
            </HStack>
          </VStack>
          <Badge colorScheme="primary" variant="subtle">
            {item.category}
          </Badge>
        </HStack>

        {/* Content */}
        <VStack px={4} pb={4}>
          <Text fontSize="md" color="gray.800" mb={2}>
            {item.title}
          </Text>
          <Text fontSize="sm" color="gray.600" numberOfLines={3}>
            {item.content}
          </Text>
        </VStack>

        {/* Image */}
        {item.image && (
          <Image
            source={{uri: item.image}}
            alt={item.title}
            height={200}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <HStack px={4} py={3} space={4} borderTopWidth={1} borderTopColor="gray.100">
          <Pressable onPress={handleLike} flexDirection="row" alignItems="center" space={1}>
            <Icon
              name={item.isLiked ? 'favorite' : 'favorite-border'}
              size={20}
              color={item.isLiked ? '#e53e3e' : '#666'}
            />
            <Text fontSize="sm" color="gray.600">
              {item.likes}
            </Text>
          </Pressable>

          <Pressable onPress={handleComment} flexDirection="row" alignItems="center" space={1}>
            <Icon name="chat-bubble-outline" size={20} color="#666" />
            <Text fontSize="sm" color="gray.600">
              {item.comments}
            </Text>
          </Pressable>

          <Pressable onPress={handleShare} flexDirection="row" alignItems="center" space={1}>
            <Icon name="share" size={20} color="#666" />
            <Text fontSize="sm" color="gray.600">
              Share
            </Text>
          </Pressable>
        </HStack>
      </Box>
    </Pressable>
  );
};

export default FeedItem;
