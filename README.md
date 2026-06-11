# Spec Kitのお勉強

## はじめに
- [Spec Kit](https://github.com/github/spec-kit)の[Getting Started](https://github.com/github/spec-kit#-get-started)を通して、仕様駆動開発で、どういったmdを準備しているのかといった、mdの内容、構造、プロンプトの流れ等、仕組みを理解して、自分たちの開発の参考にするためのものです。

- Spec Kitのドキュメントの以下の記載を読むと、仕様駆動開発（SDD）の考え方や、下で説明しているSpec kit の仕組みの理解が深まると思います。
    - [Spec Kit Documentation](https://github.com/github/spec-kit#spec-kit-documentation)
        - 特に[この章](https://github.com/github/spec-kit/blob/main/spec-driven.md#implementation-approaches)でSDDのメソトロジーをとるのに、カスタムエージェントとして必要なものが概念としてわかる。

        - [この章](https://github.com/github/spec-kit/blob/main/spec-driven.md#streamlining-sdd-with-commands)で、SDDのメソトロジーに基づくSpec Kitによるワークフローを効率化するために提供されるスラッシュコマンドがわかる。

        - [この章](https://github.com/github/spec-kit/blob/main/spec-driven.md#template-driven-quality-how-structure-constrains-llms-for-better-outcomes)で、テンプレート駆動型品質の考え方として、スラッシュコマンドの真の力は、自動化にあるだけでなく、テンプレートがLLMの出力を生産的な方法で制約する、洗練されたプロンプトとして機能し、高品質の仕様へ導くことにあるということがわかる。

## このリポジトリのブランチ

- mainブランチは[Initialize a project](https://github.com/github/spec-kit#2-initialize-a-project)の`specify init`コマンドを実行した時点のものです。
- [Getting Started](https://github.com/github/spec-kit#-get-started)のコマンドを実行したものは、[001-photo-album-organizerブランチ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer)にあります。

## Spec Kitの構造を理解する
- [Getting Started](https://github.com/github/spec-kit#-get-started)の手順に従い、`specify init`コマンドを実行しコーディングエージェントとしてGitHub Copilotを選択すると、以下のような構造のプロジェクトができます。前述のとおり、mainブランチがその直後の状態です。
    - [.github](.github)
    - [.specify](.specify)
    - [.vscode](.vscode)

- [Getting Started](https://github.com/github/spec-kit#-get-started)では、以下のスラッシュコマンドを実行するように指示されています。
    - [/speckit.constitution](.github/prompts/speckit.constitution.prompt.md)
        - プロジェクト憲章の作成
    - [/speckit.specify](.github/prompts/speckit.specify.prompt.md)
        - 機能仕様の作成
    - [/speckit.plan](.github/prompts/speckit.plan.prompt.md)
        - 機能仕様に基づいた技術的な実装計画の作成
    - [/speckit.tasks](.github/prompts/speckit.tasks.prompt.md)
        - 実装計画に基づいた実装タスクの作成
    - [/speckit.implement](.github/prompts/speckit.implement.prompt.md)
        - 実装計画に基づいた実装タスクを実行

- 各スラッシュコマンドの中身は、`agent`として、カスタムエージェント名が書かれているだけです。ですので、各スラッシュコマンドに対応するカスタムエージェントの定義の中身を覗いてみることで、プロンプトの内容や、プロンプトの流れを理解することができます。
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

- 以下の3つは、全てのカスタムエージェントの定義に共通している内容のようです。
    - `## User Input`には、ユーザの入力内容（`$ARGUMENTS`）に従う旨が記載されています。
    - `## Pre-Execution Checks`には、プロンプトの実行前に、ユーザの入力内容が正しいかどうかを確認するためのチェック項目が記載されています。
        - エージェントにより生成される[.specify/extensions.yml](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/.specify/extensions.yml)に記載された拡張機能のフックの定義に基づいて、前処理を実行します。
        - 主に、デフォルトでは、gitのブランチ作成やコミットの操作が記載されています。
        - おそらく、Spec Kitのドキュメント[Extensions — Add New Capabilities](https://github.com/github/spec-kit#extensions--add-new-capabilities)に記載されている内容に基づいて、拡張機能を追加することができます。
    - `## Mandatory Post-Execution Hooks`には、プロンプトの実行後に必ず実行されるフックが記載されています。
        - `## Pre-Execution Checks`と同様に、エージェントにより生成される[.specify/extensions.yml]に記載された拡張機能のフックの定義に基づいて、後処理を実行します。


- 結局のところ、`## Outline`に、そのカスタムエージェントが実施する本処理の内容が書かれていて、ここを中心に、プロンプトの内容や、プロンプトの流れを理解していくと良いと思います。
    - [speckit.constitution.agent.mdのOutline](.github/agents/speckit.constitution.agent.md#outline)
    - [speckit.specify.agent.mdのOutline](.github/agents/speckit.specify.agent.md#outline)
    - [speckit.plan.agent.mdのOutline](.github/agents/speckit.plan.agent.md#outline)。
    - [speckit.tasks.agent.mdのOutline](.github/agents/speckit.tasks.agent.md#outline)
    - [speckit.implement.agent.mdのOutline](.github/agents/speckit.implement.agent.md#outline)

- なお、カスタムエージェントが参照する、PowerShellのスクリプトや、生成する設計成果物のmdファイルのテンプレートは、それぞれ以下のフォルダにあります。
    - [scripts](.specify/scripts)
    - [templates](.specify/templates)


- 各スラッシュコマンドによるプロンプトおよびカスタムエージェント、スクリプトや成果物テンプレートの定義により、どういうアウトプットが実際に生成されるのかは、[001-photo-album-organizerブランチ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs/001-photo-album-organizer)の中身を見ていくとわかります。
    - デフォルトだと、[specsフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs)に、仕様毎にフォルダができて、その中に、プロンプトのアウトプットであるmdファイルが生成されていきます。
    - [specs/001-photo-album-organizer](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/specs/001-photo-album-organizer)フォルダに成果物があります。

- プロンプトを実行するごとに、主に、以下のような設計成果物が生成されていきます。
    - プロンプト[/speckit.constitution](.github/prompts/speckit.constitution.prompt.md)でプロジェクト憲章を作成
        - [constitution.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/.specify/memory/constitution.md) 
            - 併せてテンプレート[constitution-template.md](.specify/templates/constitution-template.md)を見るとよいです。
    - プロンプト[/speckit.specify](.github/prompts/speckit.specify.prompt.md)で機能仕様を作成
        - [spec.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/spec.md)
            - この時に、specsフォルダの作成や、仕様毎にgitのブランチが切られます。
            - 併せてテンプレート[spec-template.md](.specify/templates/spec-template.md)を見るとよいです。
    - プロンプト[/speckit.plan](.github/prompts/speckit.plan.prompt.md)で実装計画を作成
        - [plan.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/plan.md)
            - 併せてテンプレート[plan-template.md](.specify/templates/plan-template.md)を見るとよいです。
        - [copilot-instructions.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/.github/copilot-instructions.md) に、当該plan.mdを参照するように指示が追加されます。
        - 併せて、以下の`research.md`、`data-model.md`、`contracts/`、`quickstart.md`が、どのように作成されるかは実行するワークフローが[Phase](.github/agents/speckit.plan.agent.md#phases)に書かれているので、これも見るとプロンプトの流れがより理解できると思います
            - [research.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/research.md)
            - [data-model.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/data-model.md)
            - [contracts/](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/contracts/)
            - [quickstart.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/quickstart.md)

    - プロンプト[/speckit.tasks](.github/prompts/speckit.tasks.prompt.md)で実装タスクを作成
        - [tasks.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/tasks.md)
            - 併せてテンプレート[tasks-template.md](.specify/templates/tasks-template.md)を見るとよいです。

- 最後に、プロンプト[/speckit.implement](.github/prompts/speckit.implement.prompt.md)を実行することで、実装成果物が作成されていきます。
    - どう生成されるかの実装計画は、前述の[tasks.md](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/specs/001-photo-album-organizer/tasks.md)を参照するとよいです。
    - トップフォルダにある[package.json](https://github.com/mysd33/my-speckit-project/blob/001-photo-album-organizer/package.json)をはじめとした実装にかかわる設定ファイルや[srcフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/src)や[testsフォルダ](https://github.com/mysd33/my-speckit-project/tree/001-photo-album-organizer/tests)が作成され、実装コードが生成されていきます。