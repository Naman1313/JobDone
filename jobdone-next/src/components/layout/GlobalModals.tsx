"use client";

import CreatePostModal from '@/components/feed/CreatePostModal';
import PostJobModal from '@/components/feed/PostJobModal';
import EmergencyOverlay from '@/components/feed/EmergencyOverlay';
import AssistantSheet from '@/components/feed/AssistantSheet';
import { useActionMenu } from '@/providers/ActionMenuProvider';

export default function GlobalModals() {
  const { isAskAiOpen, setAskAiOpen } = useActionMenu();

  return (
    <>
      <CreatePostModal />
      <PostJobModal />
      <EmergencyOverlay />
      
      {/* 
        We render AssistantSheet here globally based on the context state.
      */}
      {isAskAiOpen && <AssistantSheet onClose={() => setAskAiOpen(false)} />}
    </>
  );
}
