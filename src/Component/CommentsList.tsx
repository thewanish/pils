// src/Component/CommentsList.tsx
import React from "react";
import { FlatList } from "react-native";
import CommentItem from "./CommentItem";

type Comment = {
  id: string;
  username: string;
  timeAgo: string;
  text: string;
  score: number;
  votes?: Record<string, number>;
};

type Props = {
  comments: Comment[];
};

export default function CommentsList({ comments }: Props) {
  return (
    <FlatList
      data={comments}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <CommentItem
          id={item.id}
          username={item.username}
          timeAgo={item.timeAgo}
          text={item.text}
          score={item.score}
          votes={item.votes}
        />
      )}
    />
  );
}
