import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  registerOpenComments,
  collapseActiveComments,
  hasActiveComments,
  touchActiveComments,
  resetActiveComments,
} from '../activeCommentTracker';

describe('activeCommentTracker', () => {
  beforeEach(() => {
    resetActiveComments();
  });

  it('starts with no active comments', () => {
    expect(hasActiveComments()).toBe(false);
    expect(collapseActiveComments()).toBe(false);
  });

  it('registers and collapses active comments in LIFO order', () => {
    const collapse1 = vi.fn();
    const collapse2 = vi.fn();

    const unregister1 = registerOpenComments(101, collapse1);
    const unregister2 = registerOpenComments(102, collapse2);

    expect(hasActiveComments()).toBe(true);

    // Collapsing should collapse the most recently opened (102) first
    expect(collapseActiveComments()).toBe(true);
    expect(collapse2).toHaveBeenCalledTimes(1);
    expect(collapse1).not.toHaveBeenCalled();

    // Next collapse should collapse 101
    expect(collapseActiveComments()).toBe(true);
    expect(collapse1).toHaveBeenCalledTimes(1);

    // Now empty
    expect(hasActiveComments()).toBe(false);
    expect(collapseActiveComments()).toBe(false);

    unregister1();
    unregister2();
  });

  it('unregisters an entry when cleanup is called', () => {
    const collapse1 = vi.fn();
    const unregister = registerOpenComments(201, collapse1);

    expect(hasActiveComments()).toBe(true);
    unregister();
    expect(hasActiveComments()).toBe(false);
    expect(collapseActiveComments()).toBe(false);
    expect(collapse1).not.toHaveBeenCalled();
  });

  it('promotes an entry to top when touchActiveComments is called', () => {
    const collapse1 = vi.fn();
    const collapse2 = vi.fn();

    registerOpenComments(301, collapse1);
    registerOpenComments(302, collapse2);

    // Touch 301 to bring it to top
    touchActiveComments(301);

    expect(collapseActiveComments()).toBe(true);
    expect(collapse1).toHaveBeenCalledTimes(1);
    expect(collapse2).not.toHaveBeenCalled();
  });
});
