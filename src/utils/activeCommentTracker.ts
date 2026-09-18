interface ActiveCommentEntry {
  id: string | number;
  collapse: () => void;
}

const activeCommentStack: ActiveCommentEntry[] = [];

/**
 * 注册已展开的评论区
 * @param id 动态 ID 或卡片唯一标识
 * @param collapse 收起评论区的回调函数
 * @returns 注销函数
 */
export function registerOpenComments(id: string | number, collapse: () => void): () => void {
  // 先移除同 ID 的旧记录
  const existingIndex = activeCommentStack.findIndex((item) => String(item.id) === String(id));
  if (existingIndex >= 0) {
    activeCommentStack.splice(existingIndex, 1);
  }

  activeCommentStack.push({ id, collapse });

  return () => {
    const idx = activeCommentStack.findIndex((item) => String(item.id) === String(id));
    if (idx >= 0) {
      activeCommentStack.splice(idx, 1);
    }
  };
}

/**
 * 将指定 ID 的评论区提升为当前最活跃项（例如用户点击或交互时）
 */
export function touchActiveComments(id: string | number): void {
  const idx = activeCommentStack.findIndex((item) => String(item.id) === String(id));
  if (idx >= 0) {
    const [entry] = activeCommentStack.splice(idx, 1);
    activeCommentStack.push(entry);
  }
}

/**
 * 检查当前是否有展开的评论区
 */
export function hasActiveComments(): boolean {
  return activeCommentStack.length > 0;
}

/**
 * 收起当前最活跃的评论区
 * @returns 是否成功收起
 */
export function collapseActiveComments(): boolean {
  const top = activeCommentStack.pop();
  if (top) {
    try {
      top.collapse();
      return true;
    } catch (err) {
      console.warn('收起评论区失败:', err);
    }
  }
  return false;
}

/**
 * 清空所有已注册项（主要用于测试重置）
 */
export function resetActiveComments(): void {
  activeCommentStack.length = 0;
}
