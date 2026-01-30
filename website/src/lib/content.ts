import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.join(process.cwd(), '..', 'docs', 'guides');
const PROJECTS_DIR = path.join(process.cwd(), '..', 'projects');

export interface Guide {
    slug: string;
    title: string;
    filename: string;
    content: string;
    lineCount: number;
    topics: string[];
}

export interface Project {
    slug: string;
    title: string;
    level: string;
    levelNumber: number;
    path: string;
    content: string;
    skills: string[];
    deliverable: string;
}

const GUIDE_METADATA: Record<string, { title: string; topics: string[] }> = {
    'LINUX_COMPLETE_GUIDE.md': {
        title: 'Linux',
        topics: ['File system', 'Commands', 'Scripting', 'Networking', 'Security'],
    },
    'DOCKER_COMPLETE_GUIDE.md': {
        title: 'Docker',
        topics: ['Containers', 'Images', 'Networking', 'Compose', 'Production'],
    },
    'GIT_COMPLETE_GUIDE.md': {
        title: 'Git',
        topics: ['Workflows', 'Branching', 'Merging', 'Rebasing', 'Advanced'],
    },
    'KUBERNETES_COMPLETE_GUIDE.md': {
        title: 'Kubernetes',
        topics: ['Architecture', 'Workloads', 'Networking', 'Storage', 'Security'],
    },
    'TERRAFORM_COMPLETE_GUIDE.md': {
        title: 'Terraform',
        topics: ['HCL', 'State', 'Modules', 'Workspaces', 'Best Practices'],
    },
    'ANSIBLE_COMPLETE_GUIDE.md': {
        title: 'Ansible',
        topics: ['Playbooks', 'Modules', 'Roles', 'Vault', 'Inventory'],
    },
    'ARGOCD_COMPLETE_GUIDE.md': {
        title: 'ArgoCD',
        topics: ['GitOps', 'Applications', 'Sync Strategies', 'ApplicationSets'],
    },
    'CIRCLECI_COMPLETE_GUIDE.md': {
        title: 'CircleCI',
        topics: ['Pipelines', 'Jobs', 'Orbs', 'Workflows', 'Caching'],
    },
    'ARGO_WORKFLOWS_COMPLETE_GUIDE.md': {
        title: 'Argo Workflows',
        topics: ['Workflows', 'DAGs', 'Templates', 'Artifacts'],
    },
};

const LEVEL_NAMES: Record<string, { name: string; number: number }> = {
    '01-beginner': { name: 'Beginner', number: 1 },
    '02-intermediate': { name: 'Intermediate', number: 2 },
    '03-advanced': { name: 'Advanced', number: 3 },
    '04-platform-engineering': { name: 'Platform Engineering', number: 4 },
};

export async function getGuides(): Promise<Guide[]> {
    const guides: Guide[] = [];

    try {
        const files = fs.readdirSync(DOCS_DIR);

        for (const file of files) {
            if (file.endsWith('.md') && file !== 'README.md') {
                const filePath = path.join(DOCS_DIR, file);
                const content = fs.readFileSync(filePath, 'utf-8');
                const lineCount = content.split('\n').length;
                const metadata = GUIDE_METADATA[file];

                if (metadata) {
                    guides.push({
                        slug: file.replace('_COMPLETE_GUIDE.md', '').toLowerCase(),
                        title: metadata.title,
                        filename: file,
                        content,
                        lineCount,
                        topics: metadata.topics,
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error reading guides:', error);
    }

    return guides;
}

export async function getGuide(slug: string): Promise<Guide | null> {
    const guides = await getGuides();
    return guides.find((g) => g.slug === slug) || null;
}

export async function getProjects(): Promise<Project[]> {
    const projects: Project[] = [];

    try {
        const levels = fs.readdirSync(PROJECTS_DIR);

        for (const level of levels) {
            const levelInfo = LEVEL_NAMES[level];
            if (!levelInfo) continue;

            const levelPath = path.join(PROJECTS_DIR, level);
            const stat = fs.statSync(levelPath);

            if (stat.isDirectory()) {
                const projectDirs = fs.readdirSync(levelPath);

                for (const projectDir of projectDirs) {
                    const projectPath = path.join(levelPath, projectDir);
                    const readmePath = path.join(projectPath, 'README.md');

                    if (fs.existsSync(readmePath)) {
                        const content = fs.readFileSync(readmePath, 'utf-8');
                        const titleMatch = content.match(/^#\s+(.+)$/m);
                        const skillsMatch = content.match(/Skills\s*\|\s*(.+)\s*\|/);
                        const deliverableMatch = content.match(/Deliverable\s*\|\s*(.+)\s*\|/);

                        projects.push({
                            slug: projectDir,
                            title: titleMatch ? titleMatch[1].replace(/[🐳📦🔧⚙️🚀💻🔒📊🌐]/g, '').trim() : projectDir,
                            level: levelInfo.name,
                            levelNumber: levelInfo.number,
                            path: `${level}/${projectDir}`,
                            content,
                            skills: skillsMatch ? skillsMatch[1].split(',').map((s) => s.trim()) : [],
                            deliverable: deliverableMatch ? deliverableMatch[1].trim() : '',
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error reading projects:', error);
    }

    return projects.sort((a, b) => a.levelNumber - b.levelNumber);
}

export async function getProject(level: string, slug: string): Promise<Project | null> {
    const projects = await getProjects();
    return projects.find((p) => p.slug === slug && p.path.startsWith(level)) || null;
}

export async function getProjectsByLevel(): Promise<Record<string, Project[]>> {
    const projects = await getProjects();
    const grouped: Record<string, Project[]> = {
        Beginner: [],
        Intermediate: [],
        Advanced: [],
        'Platform Engineering': [],
    };

    for (const project of projects) {
        if (grouped[project.level]) {
            grouped[project.level].push(project);
        }
    }

    return grouped;
}
