-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "pr";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "rl";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "td";

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "usr";

-- CreateTable
CREATE TABLE "usr"."users" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(256) NOT NULL,
    "email" VARCHAR(256) NOT NULL,
    "password" VARCHAR(512) NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usr"."user_info" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "first_name" VARCHAR(256) NOT NULL,
    "last_name" VARCHAR(256) NOT NULL,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,
    "user_id" UUID NOT NULL,

    CONSTRAINT "user_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pr"."permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rl"."roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rl"."role_permissions" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "role_id" UUID NOT NULL,
    "permission_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rl"."user_roles" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td"."categories" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td"."tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(100) NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td"."todos" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "title" VARCHAR(256) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL,
    "priority" SMALLINT NOT NULL DEFAULT 2,
    "due_date" TIMESTAMPTZ,
    "completed_at" TIMESTAMPTZ,
    "user_id" UUID NOT NULL,
    "category_id" UUID,
    "parent_todo_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td"."todo_comments" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "content" TEXT NOT NULL,
    "todo_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "todo_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "td"."todo_tags" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "todo_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_by" UUID NOT NULL,
    "deleted_at" TIMESTAMPTZ,
    "deleted_by" UUID,

    CONSTRAINT "todo_tags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "usr"."users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "usr"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_info_user_id_key" ON "usr"."user_info"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_name_key" ON "pr"."permissions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "rl"."roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_user_id_name_key" ON "td"."categories"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "tags_user_id_name_key" ON "td"."tags"("user_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "todo_tags_todo_id_tag_id_key" ON "td"."todo_tags"("todo_id", "tag_id");

-- AddForeignKey
ALTER TABLE "usr"."user_info" ADD CONSTRAINT "user_info_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl"."role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "rl"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl"."role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "pr"."permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl"."user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rl"."user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "rl"."roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."categories" ADD CONSTRAINT "categories_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."tags" ADD CONSTRAINT "tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todos" ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todos" ADD CONSTRAINT "todos_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "td"."categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todos" ADD CONSTRAINT "todos_parent_todo_id_fkey" FOREIGN KEY ("parent_todo_id") REFERENCES "td"."todos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todo_comments" ADD CONSTRAINT "todo_comments_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "td"."todos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todo_comments" ADD CONSTRAINT "todo_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usr"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todo_tags" ADD CONSTRAINT "todo_tags_todo_id_fkey" FOREIGN KEY ("todo_id") REFERENCES "td"."todos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "td"."todo_tags" ADD CONSTRAINT "todo_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "td"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================================
-- Custom: CHECK constraints
-- ============================================================

ALTER TABLE "td"."todos" ADD CONSTRAINT "chk_td_todos_status"
    CHECK ("status" IN ('pending', 'in_progress', 'done', 'cancelled'));

ALTER TABLE "td"."todos" ADD CONSTRAINT "chk_td_todos_priority"
    CHECK ("priority" BETWEEN 1 AND 3);

-- ============================================================
-- Custom: Partial indexes (WHERE deleted_at IS NULL)
-- ============================================================

-- pr.permissions
CREATE INDEX IF NOT EXISTS "idx_pr_permissions_name_active"
    ON "pr"."permissions" ("name")
    WHERE "deleted_at" IS NULL;

-- rl.role_permissions
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_rl_role_permissions_role_id_permission_id_active"
    ON "rl"."role_permissions" ("role_id", "permission_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_rl_role_permissions_role_id_active"
    ON "rl"."role_permissions" ("role_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_rl_role_permissions_permission_id_active"
    ON "rl"."role_permissions" ("permission_id")
    WHERE "deleted_at" IS NULL;

-- rl.user_roles
CREATE UNIQUE INDEX IF NOT EXISTS "uniq_rl_user_roles_user_id_role_id_active"
    ON "rl"."user_roles" ("user_id", "role_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_rl_user_roles_user_id_active"
    ON "rl"."user_roles" ("user_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_rl_user_roles_role_id_active"
    ON "rl"."user_roles" ("role_id")
    WHERE "deleted_at" IS NULL;

-- td.categories
CREATE INDEX IF NOT EXISTS "idx_td_categories_user_id_active"
    ON "td"."categories" ("user_id")
    WHERE "deleted_at" IS NULL;

-- td.tags
CREATE INDEX IF NOT EXISTS "idx_td_tags_user_id_active"
    ON "td"."tags" ("user_id")
    WHERE "deleted_at" IS NULL;

-- td.todos
CREATE INDEX IF NOT EXISTS "idx_td_todos_user_id_active"
    ON "td"."todos" ("user_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todos_status_active"
    ON "td"."todos" ("status")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todos_category_id_active"
    ON "td"."todos" ("category_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todos_due_date_active"
    ON "td"."todos" ("due_date")
    WHERE "deleted_at" IS NULL AND "due_date" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todos_priority_active"
    ON "td"."todos" ("priority")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todos_parent_todo_id_active"
    ON "td"."todos" ("parent_todo_id")
    WHERE "deleted_at" IS NULL AND "parent_todo_id" IS NOT NULL;

-- td.todo_comments
CREATE INDEX IF NOT EXISTS "idx_td_todo_comments_todo_id_active"
    ON "td"."todo_comments" ("todo_id", "created_at")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todo_comments_user_id_active"
    ON "td"."todo_comments" ("user_id")
    WHERE "deleted_at" IS NULL;

-- td.todo_tags
CREATE INDEX IF NOT EXISTS "idx_td_todo_tags_todo_id_active"
    ON "td"."todo_tags" ("todo_id")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_td_todo_tags_tag_id_active"
    ON "td"."todo_tags" ("tag_id")
    WHERE "deleted_at" IS NULL;

-- usr.users
CREATE INDEX IF NOT EXISTS "idx_usr_users_email_active"
    ON "usr"."users" ("email")
    WHERE "deleted_at" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_usr_users_username_active"
    ON "usr"."users" ("username")
    WHERE "deleted_at" IS NULL;

-- usr.user_info
CREATE INDEX IF NOT EXISTS "idx_usr_user_info_last_name_first_name_active"
    ON "usr"."user_info" ("last_name", "first_name")
    WHERE "deleted_at" IS NULL;
