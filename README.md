# Spec Kitのお勉強

## はじめに
- [Spec Kit](https://github.com/github/spec-kit)の[Getting Started](https://github.com/github/spec-kit#-get-started)を通して、仕様駆動開発で、どういったmdを準備しているのかといった、mdの内容、構造、プロンプトの流れ等、仕組みを理解して、自分たちの開発の参考にするためのものです。

- mainブランチは[Initialize a project](https://github.com/github/spec-kit#2-initialize-a-project)した時点のものです。
- [Getting Started](https://github.com/github/spec-kit#-get-started)のコマンドを実行したものは、[001-photo-album-organizerブランチ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer)にあります。

## Spec Kitの構造を理解する
- [Getting Started](https://github.com/github/spec-kit#-get-started)の手順を実行し、コーディングエージェントとしてGitHub Copilotを選択すると、以下のような構造のプロジェクトができます。mainブランチがその直後の状態です。
    - [.github](.github)
    - [.specify](.specify)
    - [.vscode](.vscode)

- [Getting Started](https://github.com/github/spec-kit#-get-started)では、以下のプロンプトを実行するように指示されています。
    - [/speckit.constitution](.github/prompts/speckit.constitution.prompt.md)
        - プロジェクト憲章の作成
    - [/speckit.specify](.github/prompts/speckit.specify.prompt.md)
        - 仕様の作成
    - [/speckit.plan](.github/prompts/speckit.plan.prompt.md)
        - 仕様に基づいた技術的な実装計画の作成
    - [/speckit.tasks](.github/prompts/speckit.tasks.prompt.md)
        - 実装計画に基づいた実装タスクの作成
    - [/speckit.implement](.github/prompts/speckit.implement.prompt.md)
        - 実装計画に基づいた実装タスクを実行

- 各プロンプトの中身を除くと、`agent`として、カスタムエージェント名が書かれているだけなので、各プロンプトに対応するカスタムエージェントの定義の中身を覗いてみることで、プロンプトの内容や、プロンプトの流れを理解することができます。
    - [speckit.constitution.agent.md](.github/agents/speckit.constitution.agent.md)
    - [speckit.specify.agent.md](.github/agents/speckit.specify.agent.md)
    - [speckit.plan.agent.md](.github/agents/speckit.plan.agent.md)
    - [speckit.tasks.agent.md](.github/agents/speckit.tasks.agent.md)
    - [speckit.implement.agent.md](.github/agents/speckit.implement.agent.md)

- どのカスタムエージェントの定義も、似たような文章構造をしていることがわかります。
    - `## User Input`
    - `## Pre-Execution Checks`
    - `## Outline`
    - `## Mandatory Post-Execution Hooks`

- 以下の3つは、全てのカスタムエージェントの定義に共通している内容のようです
    - `## User Input`には、ユーザの入力内容（`$ARGUMENTS`）に従う旨が記載されています。
    - `## Pre-Execution Checks`には、プロンプトの実行前に、ユーザの入力内容が正しいかどうかを確認するためのチェック項目が記載されています。
        - エージェントにより生成される[.specify/extensions.yml](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/.specify/extensions.yml)に記載された拡張機能のフックの定義に基づいて、前処理を実行します。
        - 主に、gitのブランチ作成やコミットの操作が記載されています。
    - `## Mandatory Post-Execution Hooks`には、プロンプトの実行後に必ず実行されるフックが記載されています。
        - `## Pre-Execution Checks`と同様に、エージェントにより生成される[.specify/extensions.yml]に記載された拡張機能のフックの定義に基づいて、後処理を実行します。


- なので、`## Outline`に、そのカスタムエージェントが実施する本処理の内容が書かれていて、ここを中心に、プロンプトの内容や、プロンプトの流れを理解していくと良いと思います。
    - [speckit.constitution.agent.mdのOutline](.github/agents/speckit.constitution.agent.md#outline)
    - [speckit.specify.agent.mdのOutline](.github/agents/speckit.specify.agent.md#outline)
    - [speckit.plan.agent.mdのOutline](.github/agents/speckit.plan.agent.md#outline)。
    - [speckit.tasks.agent.mdのOutline](.github/agents/speckit.tasks.agent.md#outline)
    - [speckit.implement.agent.mdのOutline](.github/agents/speckit.implement.agent.md#outline)

- なお、カスタムエージェントが参照する、PowerShellのスクリプトや、生成する設計成果物のmdファイルのテンプレートは、それぞれ以下のフォルダにあります。
    - [scripts](.specify/scripts)
    - [templates](.specify/templates)


- 各プロンプトおよびカスタムエージェント、スクリプトや成果物テンプレートの定義により、どういうアウトプットが実際に生成されるのかは、[001-photo-album-organizerブランチ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs/001-photo-album-organizer)の中身を見ていくとわかります。
    - デフォルトだと、[specフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs)に、仕様毎にフォルダができて、その中に、プロンプトのアウトプットであるmdファイルが生成されていきます。
    - [specs/001-photo-album-organizer](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs/001-photo-album-organizer)フォルダに成果物があります。

- プロンプトを実行するごとに、主に、以下のようなアウトプットが生成されていきます。
    - プロンプト[/speckit.constitution](.github/prompts/speckit.constitution.prompt.md)で作成
        - [constitution.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/.specify/memory/constitution.md)
            - 併せてテンプレート[constitution-template.md](.specify/templates/constitution-template.md)を見るとよいです。
    - プロンプト[/speckit.specify](.github/prompts/speckit.specify.prompt.md)で作成
        - [spec.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/spec.md)
            - 併せてテンプレート[spec-template.md](.specify/templates/spec-template.md)を見るとよいです。
    - プロンプト[/speckit.plan](.github/prompts/speckit.plan.prompt.md)で作成
        - [plan.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/plan.md)
            - 併せてテンプレート[plan-template.md](.specify/templates/plan-template.md)を見るとよいです。
        - 併せて、以下の`research.md`、`data-model.md`、`contracts/`、`quickstart.md`が、どのように作成されるかは実行するワークフローが[Phase](.github/agents/speckit.plan.agent.md#phases)に書かれているので、これも見るとプロンプトの流れがより理解できると思います
            - [research.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/research.md)
            - [data-model.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/data-model.md)
            - [contracts/](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/contracts/)
            - [quickstart.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/quickstart.md)

    - プロンプト[/speckit.tasks](.github/prompts/speckit.tasks.prompt.md)で作成
        - [tasks.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/tasks.md)
            - 併せてテンプレート[tasks-template.md](.specify/templates/tasks-template.md)を見るとよいです。
    - プロンプト[/speckit.implement](.github/prompts/speckit.implement.prompt.md)で作成


- 最後に、プロンプト[/speckit.implement](.github/prompts/speckit.implement.prompt.md)を実行することでトップフォルダにある[package.json](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/package.json)をはじめとした実装にかかわる設定ファイルや[srcフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/src)や[testsフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/tests)が作成され、実装コードが生成されていきます。