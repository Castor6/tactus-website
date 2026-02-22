"use client";

import { useState } from "react";
import { DownloadButton } from "./download-button";
import { UpdateSkillForm } from "./update-skill-form";

type SkillActionsProps = {
  skillId: string;
  isOwner: boolean;
  currentName: string;
  currentDescription: string;
  currentImageUrls: string[];
  currentImageKeys: string[];
};

export function SkillActions({ skillId, isOwner, currentName, currentDescription, currentImageUrls, currentImageKeys }: SkillActionsProps) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
      {!isEditing && <DownloadButton skillId={skillId} />}
      {isOwner ? (
        <UpdateSkillForm
          currentDescription={currentDescription}
          currentImageKeys={currentImageKeys}
          currentImageUrls={currentImageUrls}
          currentName={currentName}
          onOpenChange={setIsEditing}
          skillId={skillId}
        />
      ) : null}
    </div>
  );
}
