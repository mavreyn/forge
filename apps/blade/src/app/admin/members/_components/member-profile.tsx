"use client";

import { useEffect, useState } from "react";
import { User } from "lucide-react";

import type { InsertMember } from "@forge/db/schemas/knight-hacks";
import { Button } from "@forge/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@forge/ui/dialog";
import { FaGithub, FaLinkedin, FaGlobe } from "react-icons/fa";

import { api } from "~/trpc/react";

export default function MemberProfileButton({
  member,
}: {
  member: InsertMember;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const utils = api.useUtils();
  useEffect(() => {
    async function invalidateMembers() {
      await utils.member.invalidate();
    }

    invalidateMembers().catch((error) => {
      console.error("Error invalidating members in member profile: ", error);
    });
  }, [utils.member, member]);

  const memberSince = new Date(member.dateCreated ?? new Date());
  const memberGradDate = new Date(member.gradDate);
  const dateOfBirth = new Date(member.dob);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <User className="h-5 w-5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-screen overflow-y-scroll break-all">
        <DialogHeader className="flex flex-col">
          <DialogTitle className="text-center text-3xl">
            {member.firstName} {member.lastName}
          </DialogTitle>
          <p className="m-0 p-0 text-center text-sm">
            Member since {memberSince.getMonth() + 1}/
            {memberSince.getDate() + 1}/{memberSince.getFullYear()}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">General Information</h1>
            <div>
              <p>
                <b className="text-gray-400">Points:</b> {member.points}
              </p>
              <p>
                <b className="text-gray-400">Shirt Size:</b> {member.shirtSize}
              </p>
              <p>
                <b className="text-gray-400">Date Of Birth:</b>{" "}
                {dateOfBirth.getMonth() + 1}/{dateOfBirth.getDate() + 1}/
                {dateOfBirth.getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Contact Information</h1>
            <div>
              <p>
                <b className="text-gray-400">Email:</b> {member.email}
              </p>
              <p>
                <b className="text-gray-400">Phone Number:</b>{" "}
                {member.phoneNumber
                  ? member.phoneNumber
                  : "Phone number not provided."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">School Information</h1>
            <div>
              <p>
                <b className="text-gray-400">School:</b> {member.school}
              </p>
              <p>
                <b className="text-gray-400">Level Of Study:</b>{" "}
                {member.levelOfStudy}
              </p>
              <p>
                <b className="text-gray-400">Graduation Date:</b>{" "}
                {memberGradDate.getMonth() + 1}/{memberGradDate.getDate() + 1}/
                {memberGradDate.getFullYear()}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-bold">Demographic Information</h1>
            <div>
              <p>
                <b className="text-gray-400">Gender:</b> {member.gender}
              </p>
              <p>
                <b className="text-gray-400">Race Or Ethnicity:</b>{" "}
                {member.raceOrEthnicity}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-1 text-center">
            <h1 className="text-xl font-bold">Social Information</h1>
            <div className="flex flex-row gap-4 justify-center pt-2">
              <p>
                {member.githubProfileUrl
                  ? <a href={member.githubProfileUrl} target="_blank">
                      <FaGithub size={24} />
                    </a>
                  : <FaGithub size={24} color="gray" />
                  }
              </p>
              <p>
                {member.linkedinProfileUrl
                  ? <a href={member.linkedinProfileUrl} target="_blank">
                      <FaLinkedin size={24}/>
                    </a>
                  : <FaLinkedin size={24} color="gray" />
                  }
              </p>
              <p>
                {member.websiteUrl
                  ? <a href={member.websiteUrl} target="_blank">
                    <FaGlobe size={24} />
                    </a>
                  : <FaGlobe size={24} color="gray" />
                  }
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
