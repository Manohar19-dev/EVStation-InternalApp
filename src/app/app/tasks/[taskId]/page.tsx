"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/Button";
import { Card, SectionHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/overlays";
import { dateTime } from "@/lib/format";

export default function TaskDetailPage() {
  const { taskId } = useParams<{ taskId: string }>();
  const tasks = useAppStore((s) => s.tasks);
  const stations = useAppStore((s) => s.stations);
  const session = useAppStore((s) => s.session);
  const employees = useAppStore((s) => s.employees);
  const updateTaskStatus = useAppStore((s) => s.updateTaskStatus);
  const addTaskComment = useAppStore((s) => s.addTaskComment);
  const { toast } = useToast();
  const [comment, setComment] = useState("");

  const task = tasks.find((t) => t.id === taskId);
  const me = employees.find((e) => e.id === session.personaId);

  if (!task) {
    return (
      <div>
        <h1 className="t-h1">Task not found</h1>
        <Link href="/app/tasks" className="t-label text-primary-700">Back</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <Link href="/app/tasks" className="t-caption text-primary-700">← Tasks</Link>
      <div className="flex flex-wrap gap-2">
        <StatusBadge status={task.status} />
        <StatusBadge status={task.priority} />
      </div>
      <h1 className="t-h1">{task.title}</h1>
      <p className="t-body text-ink-700">{task.description}</p>
      <Card>
        <div className="space-y-2 t-body">
          <div className="flex justify-between"><span className="text-ink-500">Station</span><span>{stations.find((s) => s.id === task.stationId)?.shortName}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Due</span><span>{dateTime(task.dueAt)}</span></div>
          <div className="flex justify-between"><span className="text-ink-500">Type</span><span>{task.recurring ? task.recurrenceLabel ?? "Recurring" : "One-off"}</span></div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-2">
        {task.status !== "in_progress" && task.status !== "completed" ? (
          <Button variant="secondary" onClick={() => { updateTaskStatus(task.id, "in_progress"); toast("Marked in progress", "info"); }}>Start</Button>
        ) : null}
        {task.status !== "completed" ? (
          <Button onClick={() => { updateTaskStatus(task.id, "completed"); toast("Task completed", "success"); }}>Complete</Button>
        ) : null}
      </div>

      <div>
        <SectionHeader title="Comments" />
        <Card className="space-y-3">
          {task.comments.map((c) => (
            <div key={c.id}>
              <div className="t-label">{c.authorName}</div>
              <div className="t-body text-ink-700">{c.text}</div>
              <div className="t-caption text-ink-500">{dateTime(c.at)}</div>
            </div>
          ))}
          {!task.comments.length ? <p className="t-caption text-ink-500">No comments yet</p> : null}
          <textarea className="min-h-20 w-full rounded-md border border-line-strong px-3 py-2" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add a comment" />
          <Button
            size="md"
            disabled={!comment.trim()}
            onClick={() => {
              if (!me) return;
              addTaskComment(task.id, comment.trim(), me.id, me.name);
              setComment("");
              toast("Comment added", "success");
            }}
          >
            Post comment
          </Button>
        </Card>
      </div>
    </div>
  );
}
