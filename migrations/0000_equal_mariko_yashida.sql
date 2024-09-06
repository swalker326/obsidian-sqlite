CREATE TABLE `notes` (
	`path` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`deleted` integer DEFAULT false,
	`createdAd` integer,
	`updatedAt` integer
);
