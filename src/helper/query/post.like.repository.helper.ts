import { LikesCounterType, LikeStatus } from '../../global-types/global.types';

export function getUpdatedLike(
  likesCounter: LikesCounterType,
  lastStatus: LikeStatus,
  newStatus: LikeStatus
) {
  if (newStatus === LikeStatus.None && lastStatus === LikeStatus.Like) {
    return { ...likesCounter, likesCount: --likesCounter.likesCount };
  }
  if (newStatus === LikeStatus.None && lastStatus === LikeStatus.DisLike) {
    return { ...likesCounter, dislikesCount: --likesCounter.dislikesCount };
  }
  if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.None) {
    return { ...likesCounter, likesCount: ++likesCounter.likesCount };
  }
  if (newStatus === LikeStatus.Like && lastStatus === LikeStatus.DisLike) {
    return {
      ...likesCounter,
      likesCount: ++likesCounter.likesCount,
      dislikesCount: --likesCounter.dislikesCount
    };
  }
  if (newStatus === LikeStatus.DisLike && lastStatus === LikeStatus.None) {
    return { ...likesCounter, dislikesCount: ++likesCounter.dislikesCount };
  }
  if (newStatus === LikeStatus.DisLike && lastStatus === LikeStatus.Like) {
    return {
      ...likesCounter,
      likesCount: --likesCounter.likesCount,
      dislikesCount: ++likesCounter.dislikesCount
    };
  }
  return likesCounter;
}
