"use client";

import { useState } from "react";
import { DownloadButton } from "./download-button";
import { UpdateSkillForm } from "./update-skill-form";

type SkillActionsProps = {
  skillId: string;
  isOwner: boolean;
  currentName: string;
  currentDescription: string;
  currentImageUrl: string | null;
};

export function SkillActions({ skillId, isOwner, currentName, currentDescription, currentImageUrl }: SkillActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      {!isEditing && <DownloadButton skillId={skillId} />}
      {isOwner ? (
        <UpdateSkillForm
          currentDescription={currentDescription}
          currentImageUrl={currentImageUrl}
          currentName={currentName}
          onOpenChange={setIsEditing}
          skillId={skillId}
        />
      ) : null}
    </div>
  );
}
