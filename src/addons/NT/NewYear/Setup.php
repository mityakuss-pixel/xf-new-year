<?php

declare(strict_types=1);

namespace NT\NewYear;

use XF\AddOn\AbstractSetup;
use XF\AddOn\StepRunnerInstallTrait;
use XF\AddOn\StepRunnerUninstallTrait;
use XF\AddOn\StepRunnerUpgradeTrait;
use XF\Db\Schema\Alter;

class Setup extends AbstractSetup
{
	use StepRunnerInstallTrait;
	use StepRunnerUpgradeTrait;
	use StepRunnerUninstallTrait;

	public function installStep1(): void
	{
		$this->schemaManager()->alterTable('xf_user_option', function (Alter $table)
		{
			$table->addColumn('nt_new_year_disabled', 'tinyint')->setDefault(0);
		});
	}

	public function uninstallStep1(): void
	{
		$this->schemaManager()->alterTable('xf_user_option', function (Alter $table)
		{
			$table->dropColumns('nt_new_year_disabled');
		});
	}
}
