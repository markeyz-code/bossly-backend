import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentBusiness, CurrentUser, Permissions } from '../../common/decorators/auth.decorators';
import { PERMISSIONS } from '../../common/constants/permissions';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, ExpenseQueryDto, UpdateExpenseDto } from './dto/expense.dto';
import type { AuthenticatedUser } from '../../common/types/auth.types';

@ApiTags('Expenses')
@ApiBearerAuth()
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenses: ExpensesService) {}

  @Get('categories')
  @Permissions(PERMISSIONS.EXPENSES_READ)
  categories() {
    return this.expenses.categories();
  }

  @Get()
  @Permissions(PERMISSIONS.EXPENSES_READ)
  list(@CurrentBusiness() businessId: string, @Query() query: ExpenseQueryDto) {
    return this.expenses.list(businessId, query);
  }

  @Get(':id')
  @Permissions(PERMISSIONS.EXPENSES_READ)
  findOne(@CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.expenses.findOne(businessId, id);
  }

  @Post()
  @Permissions(PERMISSIONS.EXPENSES_WRITE)
  create(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string, @Body() dto: CreateExpenseDto) {
    return this.expenses.create(user.id, businessId, dto);
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.EXPENSES_WRITE)
  update(
    @CurrentUser() user: AuthenticatedUser,
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: UpdateExpenseDto,
  ) {
    return this.expenses.update(user.id, businessId, id, dto);
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.EXPENSES_WRITE)
  remove(@CurrentUser() user: AuthenticatedUser, @CurrentBusiness() businessId: string, @Param('id') id: string) {
    return this.expenses.remove(user.id, businessId, id);
  }
}
